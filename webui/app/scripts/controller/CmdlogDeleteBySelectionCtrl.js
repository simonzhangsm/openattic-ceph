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

var app = angular.module("openattic");
app.controller("CmdlogDeleteBySelectionCtrl", function ($scope, CmdlogService, $modalInstance, $filter, selection) {
  $scope.selectionLength = selection.length;
  $scope.itemText = false;
  if (selection.length === 1) {
    $scope.itemText = $filter("shortlog")(selection[0].text);
  }

  var ids = [];
  for (var i = 0; i < selection.length; i++) {
    ids.push(selection[i].id);
  }

  $scope.yes = function () {
    CmdlogService.delete({"ids": ids})
        .$promise
        .then(function () {
          $modalInstance.close("cloned");
        }, function (error) {
          console.log("An error occured", error);
        });
  };

  $scope.no = function () {
    $modalInstance.dismiss("cancel");

    $.smallBox({
      title: "Delete log entry",
      content: "<i class=\"fa fa-clock-o\"></i> <i>Cancelled</i>",
      color: "#C46A69",
      iconSmall: "fa fa-times fa-2x fadeInRight animated",
      timeout: 4000
    });
  };
});