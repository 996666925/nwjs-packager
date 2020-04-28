(function () {
  "use strict";
  const { promisify } = require("util");
  const exec = promisify(require("child_process").exec);
  const fs = require("fs");
  const path = require("path");

  const copy = require("recursive-copy");
  const rimraf = require("rimraf");

  const Builder = require("./Builder");

  /**
   * Windows specific packaging steps
   */
  class BuilderOsx extends Builder {
    constructor(userOptions = {}, platform = null, architecture = null) {
      super(userOptions, platform, architecture);
      this.osxAppPath = path.join(this.appOutputDir, "nwjs.app");
    }

    async packageExtras() {
      await this._addIcon();
      await this._updateInfoPlist();
      await this._updateInfoPlistStrings();
      await this._renameHelpers();
      await this._appendFiles();
    }

    /**
     * Sets the icon and the version of the app's executable.
     */
    async _addIcon() {
      console.log(`[BuilderOsx] Add icon to output .app`);

      if (this.options.appMacIcon) {
        const osxIconPath = path.join(this.osxAppPath, "Contents", "Resources", "app.icns");

        // Replace default icon with custom one
        await promisify(rimraf)(osxIconPath);
        await promisify(copy)(this.options.appMacIcon, path.join(this.osxAppPath, "Contents", "Resources", "app.icns"));

        return;
      }
    }

    /**
     * Update the app name from nwjs in all of the app plist files
     */
    async _updateInfoPlist() {
      // List of files to rename in format {path: "path/to/File", keysToUpdate: ["plist", "keys", "to", "change"]}
      const infoPlistPaths = [
        {
          path: "",
          keysToUpdate: []
        }
      ];

      return;
    }

    /**
     * Update the app name from nwjs/Chromium in all of the app InfoPlist.strings files (language specific translations)
     */
    async _updateInfoPlistStrings() {
      return;
    }

    async _renameHelpers() {
      // List of files to rename in tuples [old name, new name]
      // Note nwjs Framework.framework should retain it's original name
      const helperPaths = [
        // Main app executable file
        [
          "Contents/MacOS/nwjs",
          `Contents/MacOS/${this.options.appFriendlyName}`
        ],
        // App helpers
        [
          "Contents/Frameworks/nwjs Framework.framework/Helpers/nwjs Helper (GPU).app",
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (GPU).app`
        ],
        [
          "Contents/Frameworks/nwjs Framework.framework/Helpers/nwjs Helper (Plugin).app",
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (Plugin).app`
        ],
        [
          "Contents/Frameworks/nwjs Framework.framework/Helpers/nwjs Helper (Renderer).app",
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (Renderer).app`
        ],
        [
          "Contents/Frameworks/nwjs Framework.framework/Helpers/nwjs Helper.app",
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper.app`
        ],
        // App helper executable files
        [
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)`,
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (GPU).app/Contents/MacOS/${this.options.appFriendlyName} Helper (GPU)`,
        ],
        [
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (Plugin).app/Contents/MacOS/nwjs Helper (Plugin)`,
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (Plugin).app/Contents/MacOS/${this.options.appFriendlyName} Helper (Plugin)`,
        ],
        [
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)`,
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper (Renderer).app/Contents/MacOS/${this.options.appFriendlyName} Helper (Renderer)`,
        ],
        [
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper.app/Contents/MacOS/nwjs Helper`,
          `Contents/Frameworks/nwjs Framework.framework/Helpers/${this.options.appFriendlyName} Helper.app/Contents/MacOS/${this.options.appFriendlyName} Helper`,
        ]
      ];

      const self = this;
      helperPaths.forEach(function(pathTuple) {
        let oldPath = pathTuple[0];
        let newPath = pathTuple[1];
        console.log(`[BuilderOsx] Rename ${path.join(self.osxAppPath, oldPath)}`);
        fs.renameSync(path.join(self.osxAppPath, oldPath), path.join(self.osxAppPath, newPath));
      });

      return;
    }

    /**
     * Combines the nw.exe with the app files
     */
    async _appendFiles() {
      console.log(`[BuilderOsx] Combine app files with nw.app`);

      // Rename the .app package
      const newOsxAppPath = path.join(this.appOutputDir, `${this.options.appFriendlyName}.app`);
      fs.renameSync(this.osxAppPath, newOsxAppPath);

      // Move zip of app files inside of the .app
      const appFilesArchivePath = path.join(this.appOutputDir, "app.nw");
      fs.renameSync(appFilesArchivePath, path.join(newOsxAppPath, "Contents", "Resources", "app.nw"));

      return;
    }
  }

  module.exports = BuilderOsx;
}());
