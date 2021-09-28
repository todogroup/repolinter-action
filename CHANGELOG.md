## [1.7.3](https://github.com/todogroup/repolinter-action/compare/v1.7.2...v1.7.3) (2021-09-28)


### Bug Fixes

* update dependencies, including repolinter docker base ([3de85ee](https://github.com/todogroup/repolinter-action/commit/3de85eeec70a3b8366dd31897d97da25e2f31ede))

## [1.7.2](https://github.com/todogroup/repolinter-action/compare/v1.7.1...v1.7.2) (2021-07-22)


### Bug Fixes

* remove custom config parsing logic ([#6](https://github.com/todogroup/repolinter-action/issues/6)) ([66551a2](https://github.com/todogroup/repolinter-action/commit/66551a29a2524232f194ef9a1448eeebc5add97c)), closes [#4](https://github.com/todogroup/repolinter-action/issues/4)

## [1.7.1](https://github.com/todogroup/repolinter-action/compare/v1.7.0...v1.7.1) (2021-06-26)


### Bug Fixes

* update action.yml name ([baf8dac](https://github.com/todogroup/repolinter-action/commit/baf8dac81ac57464a30d3e3ac1b22a15b866768b))

# [1.7.0](https://github.com/todogroup/repolinter-action/compare/v1.6.5...v1.7.0) (2021-06-25)


### Bug Fixes

* update CI and files from new relic -> todogroup ([33bb80c](https://github.com/todogroup/repolinter-action/commit/33bb80ce87964580b717b6ed554e97922b920b5c))
* update dependencies ([5b89b92](https://github.com/todogroup/repolinter-action/commit/5b89b92ad79b39ada0c7d4d94ee14096e8bbf823))


### Features

* switch to canonical repolinter ([5c25b29](https://github.com/todogroup/repolinter-action/commit/5c25b29a0b917aad1c711996c8bfc32a63408545))

## [1.6.5](https://github.com/newrelic/repolinter-action/compare/v1.6.4...v1.6.5) (2020-12-29)


### Bug Fixes

* update sed command in releaserc ([2b7a8f4](https://github.com/newrelic/repolinter-action/commit/2b7a8f421557cfc88c66ab255fe11a8626451842))

## [1.6.4](https://github.com/newrelic/repolinter-action/compare/v1.6.3...v1.6.4) (2020-12-29)


### Bug Fixes

* add automatic tagging to action metadata for GHCR ([#9](https://github.com/newrelic/repolinter-action/issues/9)) ([9237b83](https://github.com/newrelic/repolinter-action/commit/9237b83797f8c15c186384d06f5d856a1f150d12))

## [1.6.3](https://github.com/newrelic/repolinter-action/compare/v1.6.2...v1.6.3) (2020-12-28)


### Bug Fixes

* update CI workflow to publish to GHCR ([702a654](https://github.com/newrelic/repolinter-action/commit/702a654c4ef5596c04ad9ce8a603e792014f9e32))

## [1.6.2](https://github.com/newrelic/repolinter-action/compare/v1.6.1...v1.6.2) (2020-12-28)


### Bug Fixes

* upgrade dependencies, and release docker image to GHCR ([cc37be3](https://github.com/newrelic/repolinter-action/commit/cc37be3d9756efbab0e59d70236f7ade0f8057de))

## [1.6.1](https://github.com/newrelic/repolinter-action/compare/v1.6.0...v1.6.1) (2020-12-18)


### Bug Fixes

* upgrade dependencies ([672d1ac](https://github.com/newrelic/repolinter-action/commit/672d1ac522eec69756285eaae5332ccc38d6359a))

# [1.6.0](https://github.com/newrelic/repolinter-action/compare/v1.5.1...v1.6.0) (2020-12-11)


### Bug Fixes

* add binstub generation to dockerfile ([f7d5e46](https://github.com/newrelic/repolinter-action/commit/f7d5e46ab7ab37c7ea6e51d357d6e9cc5a1b7b52))
* add bundle config path command ([5124fc4](https://github.com/newrelic/repolinter-action/commit/5124fc4bc2000b4da75548a952ddd1c2af6e3abe))
* add bundle gemfile env? ([4c5a16b](https://github.com/newrelic/repolinter-action/commit/4c5a16b180d1ddbac73156129373df4088aa70d4))
* add bundle gemfile to env ([9cdd62b](https://github.com/newrelic/repolinter-action/commit/9cdd62b96761f24d9b8f67bdf267222446337fcd))
* add bundle path configuration ([421866b](https://github.com/newrelic/repolinter-action/commit/421866b07511448ff914f4d73706d23aa75d49e4))
* add debugging to test licensee and linguist not being detected ([c4b6fcc](https://github.com/newrelic/repolinter-action/commit/c4b6fcc56c3f7913749f3f745243e466a7ca11ee))
* add more octokit debugging ([0c8803b](https://github.com/newrelic/repolinter-action/commit/0c8803bda87d1aebb9d7101f54c73c36a4470cf6))
* add user specifiers to dockerfile ([64d022c](https://github.com/newrelic/repolinter-action/commit/64d022cffae3547f1e47eb55d55af2bcc52097cb))
* change copy to global copy ([b72376e](https://github.com/newrelic/repolinter-action/commit/b72376ebff56f1be60a4e42555f34164c28d7296))
* fix docker working directory ([2a85c51](https://github.com/newrelic/repolinter-action/commit/2a85c51b90f0ccdff2b1036db3bb3bb596264a2e))
* fix dockerfile syntax errors ([2a1b262](https://github.com/newrelic/repolinter-action/commit/2a1b2626ad56f031ed67237b8d34496d535499f7))
* fix repolinter issue search only finding open issues ([8753b7d](https://github.com/newrelic/repolinter-action/commit/8753b7d55ab3076b9623ae47588f02df8ea620cd))
* fix type errors and upgrade ncc ([1cfa4f7](https://github.com/newrelic/repolinter-action/commit/1cfa4f73ea6446299b06be2fa7dd78fbd4d4e138))
* fix useradd commands ([25e729f](https://github.com/newrelic/repolinter-action/commit/25e729ff45c858be4ca0c362d3168c63d1897d49))
* fix working directory command ([5ef6734](https://github.com/newrelic/repolinter-action/commit/5ef67347d723cb02d48fd98342952f59206a3d4a))
* more debugging logs ([4a47f59](https://github.com/newrelic/repolinter-action/commit/4a47f59c4633195297f3cb2793953c7cae643167))
* move dockerfile build artifacts out of github workspace ([eabccdb](https://github.com/newrelic/repolinter-action/commit/eabccdba9547da9f7937a27f4301f6c4ecc0036f))
* remove debugging and finalize changes ([cab36b6](https://github.com/newrelic/repolinter-action/commit/cab36b66dec4fe2a13b61177b51644e694366c9e))
* switch to copying dist folder into dist folder ([a0bde37](https://github.com/newrelic/repolinter-action/commit/a0bde376b1662a58b0a821977c58aab435851e0e))
* update entrypoint ([e15c5fa](https://github.com/newrelic/repolinter-action/commit/e15c5fac7b055593f4667c0118cae1b4af8266ad))
* update lockfile ([325e39f](https://github.com/newrelic/repolinter-action/commit/325e39fffde39636cd8cdf021a715d197ddbe4c2))
* upgrade repolinter ([8df50c7](https://github.com/newrelic/repolinter-action/commit/8df50c767759d8882939130ce1f6e2c068da8d06))
* upgrade repolinter ([878b017](https://github.com/newrelic/repolinter-action/commit/878b017b78ef382f8997eadf2e00383e04c72f7e))


### Features

* add magic string to prevent out-of-order modifications ([2e58f1c](https://github.com/newrelic/repolinter-action/commit/2e58f1c812da8a968b99ebd7fe58ffef2d86a2c7))
* switch to docker action to install ruby and python dependencies ([2fb67f0](https://github.com/newrelic/repolinter-action/commit/2fb67f002ef82e2677fab3ed3a300c156bea94eb))

## [1.5.1](https://github.com/newrelic/repolinter-action/compare/v1.5.0...v1.5.1) (2020-10-06)


### Bug Fixes

* fix duplicate github token environment varible causing auth to fail ([c9110ba](https://github.com/newrelic/repolinter-action/commit/c9110ba1f0fc5b5ee99640d08a9b5c7e384b4c73))
* update dependencies (including @actions/core) ([9567d76](https://github.com/newrelic/repolinter-action/commit/9567d7675b7a6548696d8695030e220e66faa4ea))

# [1.5.0](https://github.com/newrelic/repolinter-action/compare/v1.4.0...v1.5.0) (2020-09-10)


### Features

* add directory input to specify a custom working directory ([8e0b796](https://github.com/newrelic/repolinter-action/commit/8e0b796b2165641d046c0d58e4769d4baa0676fc))

# [1.4.0](https://github.com/newrelic/repolinter-action/compare/v1.3.2...v1.4.0) (2020-09-04)


### Features

* upgrade repolinter version ([31e15f9](https://github.com/newrelic/repolinter-action/commit/31e15f9d5d1e562427d99698180351897ecd1eca))

## [1.3.2](https://github.com/newrelic/repolinter-action/compare/v1.3.1...v1.3.2) (2020-09-03)


### Bug Fixes

* add better error reporting ([2e60d13](https://github.com/newrelic/repolinter-action/commit/2e60d13b8226ae27344ed436824aa51a42b88212))
* add error message to issue creation 410 ([9eadd13](https://github.com/newrelic/repolinter-action/commit/9eadd1306052e7719761cca59a26cc6d4457bbfd))
* add some error reporting for testing ([b73c261](https://github.com/newrelic/repolinter-action/commit/b73c261cfca662640f2a7c2d1b7f49b52b6f8395))
* minor error clarity improvements ([63d878b](https://github.com/newrelic/repolinter-action/commit/63d878b578b272fe2882786e3ad157823e6e60a8))
* some formatting issues when printing errors ([f1c341e](https://github.com/newrelic/repolinter-action/commit/f1c341e506a650603139c9dbaf9d7d864ad94b41))

## [1.3.1](https://github.com/newrelic/repolinter-action/compare/v1.3.0...v1.3.1) (2020-08-27)


### Bug Fixes

* upgrade repolinter ([8a028c3](https://github.com/newrelic/repolinter-action/commit/8a028c3adcde11967e0a15498be8cb63d96822c7))

# [1.3.0](https://github.com/newrelic/repolinter-action/compare/v1.2.0...v1.3.0) (2020-08-26)


### Features

* add YAML support for configurations ([10fd1c3](https://github.com/newrelic/repolinter-action/commit/10fd1c3adc7f6807e7ffed4cfd26bb92b2c185df))

# [1.2.0](https://github.com/newrelic/repolinter-action/compare/v1.1.1...v1.2.0) (2020-08-26)


### Features

* switch repolinter to newrelic-forks/repolinter ([bb1be3a](https://github.com/newrelic/repolinter-action/commit/bb1be3aa1919067827bfff8142b0927baa07d523))

## [1.1.1](https://github.com/newrelic/repolinter-action/compare/v1.1.0...v1.1.1) (2020-08-14)


### Bug Fixes

* update default username to include app/ prefix ([f02300a](https://github.com/newrelic/repolinter-action/commit/f02300adc4f82d04c42acca3b56c0555b73e980a))

# [1.1.0](https://github.com/newrelic/repolinter-action/compare/v1.0.7...v1.1.0) (2020-08-14)


### Features

* add username input key to remove dependency on GitHub /user API ([f284c99](https://github.com/newrelic/repolinter-action/commit/f284c994fb50e4968c077abb0e30fd0048371939))

## [1.0.7](https://github.com/newrelic/repolinter-action/compare/v1.0.6...v1.0.7) (2020-08-14)


### Bug Fixes

* add more request debugging ([f377ec1](https://github.com/newrelic/repolinter-action/commit/f377ec13ee80c0d4ff12c1a62b39f68b67295943))

## [1.0.6](https://github.com/newrelic/repolinter-action/compare/v1.0.5...v1.0.6) (2020-08-13)


### Bug Fixes

* add debug logging ([b146162](https://github.com/newrelic/repolinter-action/commit/b146162096d0a76ad5e6222e87875a67fd7a6cc2))

## [1.0.5](https://github.com/newrelic/repolinter-action/compare/v1.0.4...v1.0.5) (2020-08-13)


### Bug Fixes

* update error handling ([39f88dc](https://github.com/newrelic/repolinter-action/commit/39f88dc190adb312723d957fc53f4226cd57c3e8))

## [1.0.4](https://github.com/newrelic/repolinter-action/compare/v1.0.3...v1.0.4) (2020-08-13)


### Bug Fixes

* switch semantic-release to dedicated action ([2c7df1f](https://github.com/newrelic/repolinter-action/commit/2c7df1f73ec1677aad45d8d918ec26fae2f754ae))

## [1.0.3](https://github.com/newrelic/repolinter-action/compare/v1.0.2...v1.0.3) (2020-08-13)


### Bug Fixes

* update releaserc to generate v1 branch ([c05349d](https://github.com/newrelic/repolinter-action/commit/c05349d9c91270486334b3a5f228766a543595f3))

## [1.0.2](https://github.com/newrelic/repolinter-action/compare/v1.0.1...v1.0.2) (2020-08-13)


### Bug Fixes

* add missing default value to token input ([af56e1f](https://github.com/newrelic/repolinter-action/commit/af56e1f54e63cb1d20f97af55d14277eef001693))

## [1.0.1](https://github.com/newrelic/repolinter-action/compare/v1.0.0...v1.0.1) (2020-08-13)


### Bug Fixes

* add branding to action metadata ([3e46b72](https://github.com/newrelic/repolinter-action/commit/3e46b72152bd91429642fe0c162fc5de01d7c3bf))

# 1.0.0 (2020-08-13)


### Bug Fixes

* add error check to repolinter output ([de85259](https://github.com/newrelic/repolinter-action/commit/de852592c6924ab1d7accba40fa302a366a6df5f))
* add output-type parameter, tests ([9f29486](https://github.com/newrelic/repolinter-action/commit/9f29486f1e249c2cd5f4b9aac090e123fa4089c2))
* upgrade repolinter to fix ncc build issue ([9a69d16](https://github.com/newrelic/repolinter-action/commit/9a69d16a6fc0732de4d767bbe4d8e10d6252e195))
* upgrade repolinter to improve formatting ([17917bd](https://github.com/newrelic/repolinter-action/commit/17917bd89df8cdcc7bd47301dc5680b0d6e0ac14))


### Features

* add issue creation to action ([3a728e3](https://github.com/newrelic/repolinter-action/commit/3a728e38ff0353667acd781caf0df19d317cd273))
* add outputs and better tests ([4e513b6](https://github.com/newrelic/repolinter-action/commit/4e513b6dba046e608ff2bd161d984bf1cb5c3a3d))
* add tests to issue creation, integrate issue creation into main ([9dedca0](https://github.com/newrelic/repolinter-action/commit/9dedca0afa2ca3d3d2a7667d0f86b22e54fc76e5))
* attempt to add issue-creation code ([17f84db](https://github.com/newrelic/repolinter-action/commit/17f84dbb35a3e9ef99200ecee39e319b37b4a2e3))
* merge branch 'feature/generate-issue' into develop ([0fc573b](https://github.com/newrelic/repolinter-action/commit/0fc573b4cb44ab16d2fd5c998e90e44021372123))
* start creating issue management lib, need to add tests ([1d0f645](https://github.com/newrelic/repolinter-action/commit/1d0f64546742c2fbc8fbfdec49c85a57baf1811d))
