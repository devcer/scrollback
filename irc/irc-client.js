/* jshint browser: true */
/* global $, libsb */

var formField = require("../lib/formField.js");
var lace = require('../lib/lace.js');
libsb.on('config-show', function (tabs, next) {
	var results = tabs.room,
		$div = $('<div>'),
		ircServer = "",
		ircChannel = "",
		notify = {},
		enabled = true;

	if (results.params.irc && results.params.irc.server && results.params.irc.channel) {
		ircServer = results.params.irc.server;
		ircChannel = results.params.irc.channel;
		enabled = results.params.irc.enabled;
	}

	var $displayMsg = formField("", "", "irc-message-text", ""),
		$infoMsg = formField("", "info", "irc-message-text", ""),
		$infoString = $infoMsg.find("#irc-message-text"),
		$errMsg = formField("", "error", "irc-message-text", ""),
		$errString = $errMsg.find("#irc-message-text");

	$div.append(formField("Enable IRC", "check", "irc-enable-check", [
					["irc-enable", "", enabled]
				]),
				formField("IRC server", "text", "irc-server", ircServer),
				formField("IRC channel", "text", "irc-channel", ircChannel),
				$displayMsg
				);

	if (results.params.irc) {
		var ircParams = results.params.irc;
		if (ircParams.error) {
			notify.type = "error";
			notify.value = null;
			if (results.params.irc.error === "ERR_CONNECTED_OTHER_ROOM") {
				$errString.text("This IRC account is already linked with another scrollback room. You can't use it until they unlink.");
			} else {
				$errString.text("Error in saving, please try again after some time");
			}

			$displayMsg.replaceWith($errMsg);
			$displayMsg = $errMsg;

		} else if (ircParams.server && ircParams.channel && ircParams.pending && ircParams.enabled) {
			notify.type = "info";
			notify.value = null;

			$.get('/r/irc/' + results.id, function (botName) {
				if (botName !== "ERR_NOT_CONNECTED") {
					$infoString.text("The IRC channel operator needs to type \"/invite " + botName + " " + results.params.irc.channel + "\" in the IRC channel to complete the process.");
					$displayMsg.replaceWith($infoMsg);
					$displayMsg = $infoMsg;
				} else {
					$errString.text("An error occured while connecting to the IRC channel. Please try again later.");
					$displayMsg.replaceWith($errMsg);
					$displayMsg = $errMsg;
				}
			});

		} else if (results.params.irc.server && results.params.irc.channel && results.params.irc.enabled) {
			$infoString.text("Connected to IRC channel: " + results.params.irc.channel);
			$displayMsg.replaceWith($infoMsg);
			$displayMsg = $infoMsg;
		} else {
			$infoString.text("Not connected :-(");
			$displayMsg.replaceWith($infoMsg);
			$displayMsg = $infoMsg;
		}
	}

	tabs.irc = {
		text: "IRC integration",
		html: $div,
		prio: 800,
		notify: notify
	};

	next();
}, 500);


libsb.on('config-save', function (room, next) {
	var server = $('#irc-server').val();
	var channel = $('#irc-channel').val();
	
	if (!server || !channel ) {
		server = "";
		channel = "";
	}
	
	room.params.irc = {
		server: server,
		channel: channel,
		enabled: $('#irc-enable').is(':checked')
	};
	next();
}, 500);

libsb.on("room-dn", function (room, next) {
	var r = room.room;
	var irc = r.params && r.params.irc;
	if (room.user.id === libsb.user.id && irc && irc.pending && !irc.error && irc.channel && irc.server && irc.enabled) {
		$.get('/r/irc/' + r.id, function (botName) {
			var displayString = "Something went wrong while connecting to IRC server";
			if (botName !== 'ERR_NOT_CONNECTED') displayString = "The IRC channel operator needs to type \"/invite " + botName +
				" " + r.params.irc.channel + "\" in the IRC channel to complete the process.";
			lace.alert.show({
				id: "irc-info-message",
				type: "info",
				body: displayString
			});
		});
	}
	next();
}, 500);
