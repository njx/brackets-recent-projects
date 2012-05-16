/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, window, $ */

define(function (require, exports, module) {
    'use strict';
    
    var PREFERENCES_KEY = "com.adobe.brackets.brackets-recent-projects";
    
    // Brackets modules
    var ProjectManager          = brackets.getModule("project/ProjectManager"),
        PreferencesManager      = brackets.getModule("preferences/PreferencesManager");
    
    var $dropdownToggle;
    
    function loadStyles(relPath) {
        var cssUrl = require.toUrl("./" + relPath);
        var fileRef = window.document.createElement("link");
        fileRef.setAttribute("rel", "stylesheet");
        fileRef.setAttribute("type", "text/css");
        fileRef.setAttribute("href", cssUrl);
        window.document.getElementsByTagName("head")[0].appendChild(fileRef);
    }
    
    function add() {
        var root = ProjectManager.getProjectRoot().fullPath,
            prefs = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY),
            recentProjects = prefs.getValue("recentProjects") || [],
            index = recentProjects.indexOf(root);
        if (index !== -1) {
            recentProjects.splice(index, 1);
        }
        recentProjects.unshift(root);
        if (recentProjects.length > 20) {
            recentProjects = recentProjects.slice(0, 20);
        }
        prefs.setValue("recentProjects", recentProjects);
        console.log("Recent projects: " + recentProjects);
    }
    
    function show(e) {
        // TODO: Can't just use Bootstrap 1.4 dropdowns for this since they're hard-coded to <li>s.
        // Have to do this stopProp to avoid the html click handler from firing when this returns.
        e.stopPropagation();
        
        var prefs = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY),
            recentProjects = prefs.getValue("recentProjects") || [],
            $dropdown = $("<div id='project-dropdown'></div>"),
            toggleOffset = $dropdownToggle.offset();
        
        function closeDropdown() {
            $("html").off("click", closeDropdown);
            $dropdown.remove();
        }
        
        recentProjects.forEach(function (root) {
            $("<div class='recent-project'></div>")
                .text(root)
                .click(function () {
                    // TODO: this isn't exactly the same as openProject()--doesn't clear out
                    // working set.
                    ProjectManager.loadProject(root);
                    closeDropdown();
                })
                .appendTo($dropdown);
        });
        
        // We use window.document here just to be paranoid about accidentally using
        // "document" to mean multiple things in the context of Brackets.
        $dropdown.css({
            left: toggleOffset.left,
            top: toggleOffset.top + $dropdownToggle.outerHeight()
        })
            .appendTo($("body"));
        $("html").on("click", closeDropdown);
    }
    
    // Initialize extension
    loadStyles("styles.css");
    
    // TODO: arrow disappears whenever project is switched--need to re-add, or put it outside
    // the title
    $dropdownToggle = $("#project-title")
        .append("<span class='dropdown-arrow'></span>")
        .click(show);
    
    $(ProjectManager).on("initializeComplete", add);
    $(ProjectManager).on("projectRootChanged", add);
});
