/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2011-2016, it-novum GmbH <community@openattic.org>
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software
 * Foundation; version 2.
 *
 * This package is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * As additional permission under GNU GPL version 2 section 3, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 1, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
"use strict";

(function () {
  var configs = require("./configs.js");
  var UnsavedChangesDialog = require("./base/UnsavedChangesDialog.js");

  var helper = {
    configs: configs,

    getConfiguredPools: () => {
      const clusters = helper.configs.cephCluster;
      const pools = clusters[Object.keys(clusters)[0]].pools;
      return Object.keys(pools).map(key => pools[key]);
    },

    /**
     * Get the absolute URL, e.g. 'http://192.168.10.105:8000/openattic/#/login'.
     * @param {string} inPageUrl The in-page URL, e.g. 'login'.
     * @return {string} Returns the requested absolute URL.
     */
    getUrl: (inPageUrl) => {
      return configs.urls.base + helper.getAbsLocationUrl(inPageUrl);
    },

    /**
     * Get the absolute location URL, e.g. '/openattic/#/ceph/pools'.
     * @param {string} inPageUrl The in-page URL, e.g. 'ceph/pools'.
     * @return {string} Returns the requested absolute location URL.
     */
    getAbsLocationUrl: (inPageUrl) => {
      return configs.urls.ui + inPageUrl;
    },

    /**
     * Browse to the specified page using in-page navigation.
     * @param {string} inPageUrl The in-page URL, e.g. 'ceph/pools'.
     * @param {boolean} dialogIsShown Set to TRUE to check whether the dialog
     *                                for unsaved changes is displayed.
     */
    setLocation: (inPageUrl, dialogIsShown) => {
      browser.setLocation(inPageUrl);
      helper.checkForUnsavedChanges(dialogIsShown);
      helper.checkLocation(inPageUrl);
    },

    /**
     * Ensure that the specified in-page URL equals with the current page.
     * @param {string} inPageUrl The in-page URL, e.g. 'ceph/rgw/users'.
     *                           This can be a regular expression.
     */
    checkLocation: (inPageUrl) => {
      const expected = helper.getAbsLocationUrl(inPageUrl);
      expect(browser.getCurrentUrl()).toMatch(expected);
    },

    leaveForm: function (dialogIsShown) {
      element(by.css(".tc_backButton")).click();
      helper.checkForUnsavedChanges(dialogIsShown);
    },

    checkForUnsavedChanges: function (dialogIsShown) {
      var dialog = new UnsavedChangesDialog();
      if (dialogIsShown !== undefined) {
        expect(dialog.leaveBtn.isPresent()).toBe(dialogIsShown);
      }
      dialog.leaveBtn.isDisplayed().then(function () {
        dialog.close();
      }).catch(function () {});
    },

    get_list_element: function (itemName) {
      return element(by.cssContainingText("tr", itemName));
    },

    /**
     * Get the cells of the specified row.
     * @param itemName The value to identify the data table row.
     */
    get_list_element_cells: function (itemName) {
      var row = helper.get_list_element(itemName);
      return row.all(by.tagName("td"));
    },

    /**
     * Will delete the selected items, using the default test classes for this.
     * @param {number} dropdown Which dropdown to get. Defaults to 0.
     * @param {string} controllerName The name of the controller.
     * @param {stzring} elementName The name of the element that should be deleted
     * @param {boolean} dialogIsShown If set to TRUE or FALSE, then it is checked
     *                                whether the dialog is displayed or not. If
     *                                set to TRUE, the deletion is confirmed by
     *                                entering 'yes'. Defaults to TRUE.
     */
    delete_selection: function (dropdown, controllerName, elementName, dialogIsShown) {
      dropdown = dropdown || 0;
      dialogIsShown = (dialogIsShown === undefined) ? true : dialogIsShown;
      element.all(by.css(".tc_menudropdown")).get(dropdown).click();
      element(by.css(".tc_deleteItem > a")).click();
      let enteredNameInput = "input.enteredName";
      if (controllerName) {
        enteredNameInput = controllerName + "." + enteredNameInput;
      }
      // Make sure the dialog is shown or not.
      let enteredNameElement = element(by.model(enteredNameInput));
      expect(enteredNameElement.isPresent()).toBe(dialogIsShown);
      // If the dialog is expected to be shown, then confirm the deletion.
      if (dialogIsShown) {
        enteredNameElement.sendKeys(elementName);
        element(by.css(".tc_submitButton")).click();
      }
    },

    /**
     * Clear the search filter.
     */
    clear_search_for: () => {
      element(by.model("filterConfig.search")).clear();
    },

    /**
     * Set the given search filter.
     * @param {string} query The filter query.
     */
    search_for: function (query) {
      helper.changeInput(element(by.model("filterConfig.search")), query);
    },

    search_for_element: function (query) {
      helper.search_for(query);
      return helper.get_list_element(query);
    },

    /**
     * Log into the WebUI.
     * @param {string} username The username to use. Defaults to the
     *                          configs.username if not set.
     * @param {string} password The password to use. Defaults to the
     *                          configs.password if not set.
     * @param {boolean} browse Set to FALSE to do not browse to the
     *                         login page. Defaults to TRUE.
     */
    login: function (username, password, browse) {
      username = username || configs.username;
      password = password || configs.password;
      browse = (browse !== undefined) ? browse : true;
      if (browse) {
        browser.get(helper.getUrl("login"));
      }
      element.all(by.model("$ctrl.username")).clear().sendKeys(username);
      element.all(by.model("$ctrl.password")).clear().sendKeys(password);
      element.all(by.css('input[type="submit"]')).click();
    },

    /**
     * Changes the value of an input field.
     * @param {object} e is the input field element.
     * @param {string} val is the value the field will be changed to.
     */
    changeInput (e, val) {
      this.waitForElementVisible(e);
      e.clear().sendKeys(val).sendKeys(protractor.Key.TAB);
    },

    /**
     * Selects option from a drop down option list.
     * Select through option position or part of the option name.
     *
     * @param {object} select element
     * @param {string|number} query
     */
    selectOption: (select, query) => {
      select.click();
      let option = {};
      if (typeof query === "string") {
        option = select.element(by.cssContainingText("option", query));
      } else {
        option = select.all(by.tagName("option")).get(query);
      }
      option.isPresent().then(present => {
        if (present) {
          option.click();
        }
        select.click();
      });
    },

    getOptionText: select => {
      return select.getAttribute("value").then(value => {
        return select.element(by.css("option[value='" + value + "']")).getText();
      });
    },

    /**
     * Check if the given element has the given class.
     * @param {object} element The element to check.
     * @param {string} cls The name of the class to check for.
     */
    hasClass: function (element, cls) {
      return element.getAttribute("class").then(function (classes) {
        return classes.split(" ").indexOf(cls) !== -1;
      });
    },

    deleteAllIfExists: function (name) {
      element(by.css(".tc_entries_dropdown")).click();
      element(by.css(".tc_entries_100")).click();

      helper.search_for(name);

      browser.findElements(by.css(".tc_datableNoMatch.ng-hide")).then(function (elems) {
        if (elems.length > 0) {
          element(by.model("selection.checkAll")).click();
          helper.delete_selection(undefined, "$ctrl");
        }
      });

      element(by.css(".tc_entries_dropdown")).click();
      element(by.css(".tc_entries_10")).click();
    },

    waitForElement (elem) {
      var until = protractor.ExpectedConditions;
      browser.wait(until.presenceOf(elem), 360000, "Element taking too long to appear in the DOM");
    },

    waitForElementRemoval (elem) {
      if (elem === "submit") {
        elem = element(by.css(".tc_submitButton .fa.fa-spinner"));
      }
      var until = protractor.ExpectedConditions;
      browser.wait(until.stalenessOf(elem), 360000, "Element taking too long to disappear in the DOM");
    },

    waitForElementVisible (elem) {
      if (elem === "submit") {
        elem = element(by.css(".tc_submitButton .fa.fa-spinner"));
      }
      var until = protractor.ExpectedConditions;
      browser.wait(until.visibilityOf(elem), 360000, "Element taking too long to show in the DOM");
    },

    waitForElementInvisible (elem) {
      if (elem === "submit") {
        elem = element(by.css(".tc_submitButton .fa.fa-spinner"));
      }
      var until = protractor.ExpectedConditions;
      browser.wait(until.invisibilityOf(elem), 360000, "Element taking too long to disappear in the DOM");
    },

    /**
     * This method is a shortcut for selecting an item in the datatable and then
     * picking the edit action.
     * It will result in opening the edit page for that element.
     *
     * @param {any} itemName string or regex that represents the name of the item you want to edit
     */
    selectAndEdit (itemName) {
      this.get_list_element(itemName).click();
      element(by.className("tc_edit_btn")).click();
    },

    /**
     * Shortcut for verifying if a given property is displayed in the details tab
     *
     * @param {string} value name of the property that should be displayed
     */
    checkDetailIsDisplayed (value) {
      expect(element(by.cssContainingText("dd", value)).isDisplayed()).toBe(true);
    }

  };
  module.exports = helper;
}());
