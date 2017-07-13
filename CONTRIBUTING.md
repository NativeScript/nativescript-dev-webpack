Contributing
====================

## Introduction

First of all, thank you for taking the time to contribute!

Before starting, make yourself familiar with the `nativescript-dev-webpack`'s [documentation](http://docs.nativescript.org/best-practices/bundling-with-webpack) and the official NativeScript [Contributing guide](https://github.com/NativeScript/NativeScript/blob/master/CONTRIBUTING.md).

## Project Structure

The repository contains several ingredients:
*   `installer.js` - combination of postinstall scripts for adding or removing webpack configurations and necessary dependecies when installing the plugin.
*	`prepublish` - [Webpack config](https://webpack.js.org/concepts/configuration/) snippets used for generating webpack configuration templates. The latter are generated with the npm's `prepublishOnly` script. **If you want to modify the distributed webpack configurations - that's the right place to do it.**
*   `templates` - webpack config templates for different types of projects - NativeScript with JavaScript, NativeScript with TypeScript and NativeScript Angular projects.
*   `plugins` - several [Webpack plugins](https://webpack.js.org/concepts/plugins/) necessary for bundling NativeScript applications.
*   `snapshot/android` - tools used with the `NativeScriptSnapshot` plugin for generating V8 Heap Snapshots.
*   `nativescript-target` - configuration of a [Webpack deployment target](https://webpack.js.org/concepts/targets/) for building NativeScript applications.
*   `bin` - helper node/npm scripts for projects using the plugin.
*   `bin/ns-bundle` - node script used for bundling the project with Webpack and building the native Android/iOS application with NativeScript CLI.   


## Setup
[Fork](https://help.github.com/articles/fork-a-repo/) and clone the GitHub repository:
```bash
git clone https://github.com/your-username/nativescript-dev-webpack.git
```

Create a branch for your changes:
```bash
git checkout -b <my-fix-branch> master
```

Install devDependencies:
```bash
npm install
```

You are good to go! The plugin is written in plain JavaScript. You're strongly encouraged to follow the official NativeScript [Coding Conventions](https://github.com/NativeScript/NativeScript/blob/master/CodingConvention.md) and to use ES features available in NodeJS v6. If unsure, check on [node.green](http://node.green/).

## Testing locally

Create a new NativeScript project with NativeScript CLI:
``` bash
tns create testapp # pass --ng/--tsc for Angular/TypeScript app
```

Install/Link your local copy of the plugin:
``` bash
npm install/link /path/to/repo/nativescript-dev-webpack
```

Make sure to force-update the project's configuration files if it's already using webpack.
``` bash
rm -rf node_modules platforms webpack.* app/vendor*
./node_modules/.bin/update-ns-webpack # force update dependecies and add the new configs
npm i # install new dependencies
```

## Submitting PR

* Create one or several commits describing your changes. Follow the [Angular Commit message guidelines](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w).

*   Push your branch to GitHub:

    ```source-shell
    git push origin my-fix-branch
    ```

In GitHub, send a pull request to `nativescript-dev-webpack:master`. If we suggest changes, then:

*   Make the required updates.
*   Commit the changes to your branch (e.g. `my-fix-branch`).
*   Push the changes to your GitHub repository (this will update your PR).

If the PR gets too outdated you may need to rebase and force push to update the PR:

```bash
git rebase -i master
git push -f origin my-fix-branch
```

Thank you for your contribution!

