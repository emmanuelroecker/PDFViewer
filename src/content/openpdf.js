/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is PDF Viewer
 *
 * The Initial Developer of the Original Code is
 *  Emmanuel ROECKER and Rym BOUCHAGOUR <contact@glicer.com>
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var openpdf = {
	onLoad: function (evt) {
		if (this.initialized) {
			return;
		}
		this.initialized = true;

		if (window.location.href == "chrome://messenger/content/messenger.xul" || window.location.href == "chrome://messenger/content/messageWindow.xul") {
			var openAttachmentORIG = AttachmentInfo.prototype.open;
			AttachmentInfo.prototype.open = function () {
				if (!openpdf.open(this)) {
					openAttachmentORIG.apply(this, arguments);
				}
			};
		}

		if (window.location.href == "chrome://messenger/content/messengercompose/messengercompose.xul") {
			var OpenSelectedAttachmentORIG = OpenSelectedAttachment;
			OpenSelectedAttachment = function () {
				var bucket = document.getElementById("attachmentBucket");
				if (bucket.selectedItems.length == 1) {
					var aAttachment = bucket.getSelectedItem(0).attachment;
					var messagePrefix = /^mailbox-message:|^imap-message:|^news-message:/i;
					if (messagePrefix.test(aAttachment.url))
						var skipdefaultaction = null;
					else
						var skipdefaultaction = openpdf.open(aAttachment);
					if (!skipdefaultaction)
						OpenSelectedAttachmentORIG.apply(this, arguments);
				}
			};
		}
	},

	open: function (attachment) {
		var attUrl = attachment.url;
		var attName = attachment.name;
		var dotpos = attUrl.lastIndexOf(".");
		if (dotpos > -1) {
			var ext = attUrl.substring(dotpos + 1).toLowerCase();
			if (ext == "pdf") {
				var kViewerUrl = "chrome://pdfviewer/content/wrapper.xul?uri=";
				kViewerUrl += encodeURIComponent(attUrl) + "&name=" + encodeURIComponent(attName);

				let tabmail = document.getElementById("tabmail");
				if (!tabmail) {
					// Try opening new tabs in an existing 3pane window
					let mail3PaneWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow("mail:3pane");
					if (mail3PaneWindow) {
						tabmail = mail3PaneWindow.document.getElementById("tabmail");
						mail3PaneWindow.focus();
					}
				}

				if (tabmail)
					tabmail.openTab("chromeTab", { chromePage: kViewerUrl });
				else
					window.openDialog("chrome://messenger/content/", "_blank",
						"chrome,dialog=no,all", null,
						{
							tabType: "chromeTab",
							tabParams: { chromePage: kViewerUrl }
						});
				return true;
			}
		}

		return false;
	}
}

window.addEventListener("load", function (evt) { openpdf.onLoad(evt); }, false);

