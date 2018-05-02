/**
 * admin.js
 *
 * This file contains button click handlers for the administrator section
 */

var dashboardBtn = $('#dashboard');
var remoteControlBtn = $('#remoteControl');
var remoteControlDiv = $('#rc-container');
var dashboardDiv     = $('#dash-container');
var arduinoBtn = $('#arduino');
var arduinoContainer = $('#upload-container');


// Dashboard button click handler
dashboardBtn.click( function () {

    // Remote display:none css selector, and add it to every other view
    remoteControlDiv.addClass('display-none');
    dashboardDiv.removeClass('display-none');
    arduinoContainer.addClass('display-none');

    // Add the css class for active button highlighting
    remoteControlBtn.removeClass('active');
    dashboardBtn.addClass('active');
    arduinoBtn.removeClass('active');


    // Call our Ajax function to populate numbers
    getStats();
});

// Remote control button click handler
remoteControlBtn.click(function () {

    // Remove display:none css selector, and add it to every other view
    remoteControlDiv.removeClass('display-none');
    dashboardDiv.addClass('display-none');
    arduinoContainer.addClass('display-none');

    // Add the css class for active button highlighting
    remoteControlBtn.addClass('active');
    dashboardBtn.removeClass('active');
    arduinoBtn.removeClass('active');

});

// Arduino control button click handler
arduinoBtn.click(function () {

    // Remove display:none css selector, and add it to every other view
    arduinoContainer.removeClass('display-none');
    dashboardDiv.addClass('display-none');
    remoteControlDiv.addClass('display-none');


    // Add the css class for active button highlighting
    arduinoBtn.addClass('active');
    dashboardBtn.removeClass('active');
    remoteControlBtn.removeClass('active');

});






$('#logout').click(function () {
    window.location.href = '/logout';
});