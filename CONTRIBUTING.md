# Contributing
====================

<!-- TOC depthFrom:2 -->

- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Testing locally](#testing-locally-by-running-e2e-tests)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Submitting PR](#submitting-pr)
- [Publishing new versions](#publishing-new-versions)

<!-- /TOC -->

## Introduction

First of all, thank you for taking the time to contribute!

Before starting, make yourself familiar with the `nativescript-dev-webpack`'s [documentation](http://docs.nativescript.org/best-practices/bundling-with-webpack) and the official [NativeScript Code Of Conduct]( https://github.com/NativeScript/codeofconduct).

## Project Structure

The repository contains several ingredients:
*   `installer.js` - combination of postinstall scripts for adding or removing webpack configurations and necessary dependecies when installing the plugin.
*   `templates/` - webpack config templates for different types of projects - NativeScript with JavaScript, NativeScript with TypeScript and NativeScript Angular projects.
*   `plugins/` - several [Webpack plugins](https://webpack.js.org/concepts/plugins/) necessary for bundling NativeScript applications.
*   `snapshot/android/` - tools used with the `NativeScriptSnapshot` plugin for generating V8 Heap Snapshots.
*   `nativescript-target/` - configuration of a [Webpack deployment target](https://webpack.js.org/concepts/targets/) for building NativeScript applications.
*   `bin/` - helper node/npm scripts for projects using the plugin.
*   `demo/` - resides several NativeScript applications, testing different scenarios. You can execute each app's tests by navigating to its directory and running `npm run e2e -- --runType nameOfRuntype`. For more information on runTypes, check out the [nativescript-dev-appium](https://github.com/NativeScript/nativescript-dev-appium#custom-appium-capabilities) plugin.

## Setup

> Note that you need npm 5+ for local development of the plugin.
1. [Fork](https://help.github.com/articles/fork-a-repo/) and clone the GitHub repository:
    ```bash
    git clone https://github.com/your-username/nativescript-dev-webpack.git
    ```

2. Add an 'upstream' remote pointing to the original repository:
    ```bash
    cd nativescript-dev-webpack
    git remote add upstream https://github.com/NativeScript/nativescript-dev-webpack.git
    ```

3. Create a branch for your changes:
    ```bash
    git checkout -b <my-fix-branch> master
    ```

4. Install dependencies:
    ```bash
    npm install
    ```

The last command also runs `npm prepare` which compiles the TypeScript files in the plugin. 
You are good to go! You're strongly encouraged to follow the official NativeScript [Coding Conventions](https://github.com/NativeScript/NativeScript/blob/master/CodingConvention.md) and to use ES features available in NodeJS v6. If unsure, check on [node.green](http://node.green/).

## Testing locally by running e2e tests

NOTE: There are three test apps in the repository, located in the `/demo` directory. The steps below describe how to run the tests for the `AngularApp`, but the same approach can be used to run any other `e2e` tests.

1. Navigate to `demo/AngularApp`
    ``` bash
    cd demo/AngularApp
    ```

2. Install dependencies. This also installs your local copy of the nativescript-angular plugin.
    ``` bash
    npm install
    ```
3. Make sure to have an emulator set up or connect a physical Android/iOS device.

4. Build the app for Android or iOS
    ``` bash
    tns run android/ios
    ```

5. Install [appium](http://appium.io/) globally.
    ``` bash
    npm install -g appium
    ```

6. Follow the instructions in the [nativescript-dev-appium](https://github.com/nativescript/nativescript-dev-appium#custom-appium-capabilities) plugin to add an appium capability for your device inside `./e2e/renderer/e2e/config/appium.capabilities.json`.

7. Run the automated tests. The value of the `runType` argument should match the name of the capability that you just added.
    ``` bash
    npm run e2e -- --runType capabilityName
    ```

## Reporting Bugs

1. Always update to the most recent master release; the bug may already be resolved.
2. Search for similar issues in the issues list for this repo; it may already be an identified problem.
3. If this is a bug or problem that is clear, simple, and is unlikely to require any discussion -- it is OK to open an issue on GitHub with a reproduction of the bug including workflows and screenshots. If possible, submit a Pull Request with a failing test, entire application or module. If you'd rather take matters into your own hands, fix the bug yourself (jump down to the [Submitting a PR](#submitting-pr) section).

## Requesting Features

1. Use Github Issues to submit feature requests.
2. First, search for a similar request and extend it if applicable. This way it would be easier for the community to track the features.
3. When requesting a new feature, please provide as much detail as possible about why you need the feature in your apps. We prefer that you explain a need rather than explain a technical solution for it. That might trigger a nice conversation on finding the best and broadest technical solution to a specific need.

## Submitting PR

1. Create one or several commits describing your changes. Follow the [Angular commit message guidelines](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w).

2. Push your branch to GitHub:
    ```bash
    git push origin my-fix-branch
    ```

3. In GitHub, send a pull request to `nativescript-dev-webpack:master`. If we suggest changes, then:

    *   Make the required updates.
    *   Commit the changes to your branch (e.g. `my-fix-branch`).
    *   Push the changes to your GitHub repository (this will update your PR).

4. If your branch gets too outdated you may need to rebase it on top of the upstream master and force push to update your PR:

    1. Fetch the latest changes
        ```bash
        git fetch upstream
        ```

    2. Check out to your fork's local `master` branch
        ```bash
        git checkout master
        ```

    3. Merge the original repo changes into your local `master` branch
        ```bash
        git merge upstream/master
        ```

    4. Rebase it on top of `master`
        ```bash
        git rebase -i master
        ```

    5. Update your PR with force push
        ```bash
        git push -f origin my-fix-branch
        ```

Thank you for your contribution!

## Publishing new versions

1. Run `npm install` to install the dependencies and prepare the package for publishing.
```bash
npm install
```

2. Remove the `package-lock.json` file if it was generated.
```bash
rm package-lock.json
```

3. Add the following to your `.npmrc`.
```
tag-version-prefix=""
message="release: cut the %s release"
```

4. Create new branch for the release:
```
git checkout -b username/release-version
```

5. Run `npm version` to bump the version in the `package.json`, tag the release and update the CHANGELOG.md:
```
npm version [patch|minor|major]
```

6. Push all changes to your branch and create a PR.
```bash
git push --set-upstream origin username/release-version --tags
```

7. Publish the package to npm after the PR is merged.
```bash
npm publish
```

