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

var app = angular.module("openattic.userinfo");
app.directive("userinfo", function () {
  return {
    restrict: "E",
    template: [
      "<div class=\"login-info\">",
      "<span>",
      "<a ui-sref=\"users-edit({user:user.id})\" id=\"show-shortcut\" data-action=\"toggleShortcut\">",
      "<span class=\"tc_usernameinfo\" ng-if=\"user.first_name === '' && user.last_name === ''\" ",
          "ng-bind=\"user.username\"></span>",
      "<span class=\"tc_usernameinfo\" ng-if=\"user.first_name !== '' || user.last_name !== ''\" ",
          "ng-bind=\"user.first_name + ' ' + user.last_name\"></span>",
      "</a>",
      "</span>",
      "</div>"
    ].join(""),
    controller: function ($rootScope, UserService) {
      UserService.current()
      .$promise
      .then(function (res) {
        $rootScope.user = res;
      })
      .catch(function () {
        console.log("an error occured");
      });
    }
  };
});
