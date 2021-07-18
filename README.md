# TODOGroup Repolinter Action v1

[![GitHub Marketplace version](https://img.shields.io/github/release/todogroup/repolinter-action.svg?label=Marketplace&logo=github)](https://github.com/marketplace/actions/todogroup-repolinter-action) ![CI](https://github.com/todogroup/repolinter-action/workflows/CI/badge.svg?event=push)

This action runs [Repolinter](https://github.com/todogroup/repolinter) on your repository. Repolinter's optional external dependencies (licensee, linguist, github-markup) are installed using a docker build step. Optionally you can also configure this tool to create GitHub issues with the Repolinter output.

The original version of this tool was created by [New Relic](https://github.com/newrelic), and this fork was created to continue development under [TODOGroup](https://github.com/todogroup).

## Inputs

```yaml
- uses: todogroup/repolinter-action@v1
  with:
    # The directory Repolinter should run against. Accepts an absolute path
    # or a path relative to $GITHUB_WORKSPACE.
    #  
    # Defaults to $GITHUB_WORKSPACE.
    directory: ''

    # A path to the JSON/YAML Repolinter ruleset to use, relative to the
    # `directory` input.
    # 
    # This option is mutually exclusive with config_url. If this option and 
    # config_url are not specified, Repolinter's default ruleset will be used.
    config_file: ''

    # A URL to pull the JSON/YAML Repolinter ruleset from. This URL must be accessible
    # by the actions runner and return raw JSON file on GET.
    #
    # This option can be used to pull a ruleset from GitHub using the
    # raw.githubusercontent.com URL (ex. https://raw.githubusercontent.com/aperture-science-incorporated/.github/master/repolinter-newrelic-communityplus.json).
    #
    # This option is mutually exclusive with config_file. If this option and 
    # config_file are not specified, Repolinter's default ruleset will be used.
    config_url: ''

    # Where repolinter-action should put the linting results. There are two
    # options available:
    # * "exit-code": repolinter-action will print the lint output to the console
    #   and set the exit code to result.passed. This output type is most useful for
    #   PR status checks.
    # * "issue": repolinter-action will create a GitHub issue on the current
    #   repository with the repolinter output and always exit 0. See the README for
    #   more details on issue outputting behavior. This output type is ideal for 
    #   non-intrusive notification.
    # 
    # Default: "exit-code"
    output_type: ''

    # The title to use for the issue created by repolinter-action. This title 
    # should indicate the purpose of the issue, as well as that it was created by
    # a bot.
    #
    # This option will be ignored if output_type != "issue".
    #
    # Default: "[Repolinter] Open Source Policy Issues"
    output_name: ''

    # The name to use for the issue label created by repolinter-action. This name
    # should be unique to repolinter-action (i.e. not used by any other issue) to
    # prevent repolinter-action from getting confused.
    #
    # This option will be ignored if output_type != "issue".
    #
    # Default: "repolinter"
    label_name: ''

    # The color to use for the issue label created by repolinter-action. The value
    # for this option should be an unprefixed RRGGBB hex string (ex. ff568a).
    # The default value is a shade of yellow.
    #
    # This option will be ignored if output_type != "issue".
    #
    # Default: "fbca04"
    label_color: ''

    # Personal access token (PAT) used to create an issue on this repository.
    # This token is optional and only required if this actions is configured to
    # output an issue (see `output_type`). This token must have the `public_repo`
    # scope for the current repository in order to work properly.
    #
    # [Learn more about creating and using encrypted secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Default: ${{ github.token }}
    token: ''

    # The username associated with the `token` field. Repolinter-action uses 
    # this value to determine which issues have been created by itself. Prefix
    # this value with `app/` if `token` is generated from a GitHub app instead
    # of a normal user (see https://docs.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests#search-by-author).
    #  
    # Defaults to the username associated with the `GITHUB_TOKEN` provided by Github 
    # Actions.
    #
    # Default: app/github-actions
    username: ''

    # The repository name and owner, formatted like so: `owner/repository`.
    # This input determines which repository repolinter-action will create
    # an issue on, if that functionality is enabled.
    #
    # It is recommended that this option is left as the default value.
    # 
    # Default: ${{ github.repository }}
    repository: ''
```

## Outputs

| Key           | Type    | Description                                                                                                   |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `passed`      | boolean | A boolean indicating whether or not the ruleset passed, equivalent to `LintResult#passed`.                    |
| `errored`     | boolean | A boolean indicating whether or or not any errors occurred when running repolinter-action                     |
| `json_output` | string? | The JSON-ified repolinter output from `repolinter.jsonFormatter`. Will only be present if `errored` is false. |

## Usage

### Validate master branch with the default ruleset

The following will run Repolinter with the default ruleset on every push to master, and exit with status 1 if the repository does not pass.

```yaml

name: 'Validate master branch with Repolinter'

on:
  push:
    branches:
      - master

jobs:
  repolinter-action:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: 'Run Repolinter'
        uses: todogroup/repolinter-action@v1

```

### Validate master branch with a remote ruleset

The following will run Repolinter with a [remote ruleset](https://raw.githubusercontent.com/aperture-science-incorporated/.github/master/repolinter-newrelic-communityplus.json) on every push to master, and exit with status 1 if the repository does not pass.

```yaml

name: 'Validate master branch with Repolinter'

on:
  push:
    branches:
      - master

jobs:
  repolinter-action:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: 'Run Repolinter'
        uses: todogroup/repolinter-action@v1
        with:
          config_url: https://raw.githubusercontent.com/aperture-science-incorporated/.github/master/repolinter-newrelic-communityplus.json

```

### Open an issue on validation fail

The following will run repolinter with a [remote ruleset](https://raw.githubusercontent.com/aperture-science-incorporated/.github/master/repolinter-newrelic-communityplus.json) on every push to master, and open a GitHub issue if the repository does not pass.

```yaml
name: 'Validate master branch with Repolinter'

on:
  push:
    branches:
      - master

jobs:
  # Because the output-type is set to 'issue', this job will always succeed.
  repolinter-action:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: 'Run Repolinter'
        uses: todogroup/repolinter-action@v1
        with:
          config_url: https://raw.githubusercontent.com/aperture-science-incorporated/.github/master/repolinter-newrelic-communityplus.json
          output_type: issue
          # Optionally you can customize the issue and label repolinter-action will create
          output_name: '[Bot] My Issue Title'
          label_name: 'my-repolinter-label'
          label_color: 'ffffff'
```

### Run against another repository

The following will run repolinter with the default ruleset against [aperture-science-incorporated/companion-cube](https://github.com/aperture-science-incorporated/companion-cube) on every push to master of the current repository; if the ruleset does not pass, repolinter-action will open a GitHub issue on companion-cube. Note that a custom personal access token (`MY_TOKEN`) and PAT username (`my-token-username`) must be specified, as `GITHUB_TOKEN` [does not have write permission for repositories other than the current one](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#about-the-github_token-secret).

```yaml
name: Apply Repolinter
on:
  push:
    branches:
      - master

jobs:
  apply-repolinter:
    name: Apply Repolinter Somewhere Else
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
        with:
          repository: aperture-science-incorporated/companion-cube
      
      - name: Run Repolinter
        uses: todogroup/repolinter-action@v1
        with:
          output_type: issue
          repository: aperture-science-incorporated/companion-cube
          username: my-token-username
          token: ${{ secrets.MY_TOKEN }}
```

## Issue Creation Behavior

If `output_type` is set to `issue`, repolinter-action will create a GitHub issue with the Repolinter output on the current repository. An example issue can be found here: https://github.com/aperture-science-incorporated/companion-cube/issues/44. 

To prevent unnecessary noise, repolinter-action will first attempt to edit an existing open issue before creating a new one. This check is performed every workflow run, and can be emulated using the following [GitHub search](https://docs.github.com/en/github/searching-for-information-on-github) query:
```
type:issue repo:<the current repo> creator:<username> label:<label-name> state:open sort:author-date-desc
```
If no issues are returned by this query, repolinter-action will create a new one. If more than one issue is returned by this query, repolinter-action will edit the first issue in the list (the issue most recently created) and ignore the others.

### Consistency

As GitHub Actions can run many workflows in parallel, repolinter-action runs may happen in a different order than commits occurred. To prevent out-of-order action runs from generating issue noise, repolinter-action will first search the body of the most recently created repolinter-action issue (open or closed) for a magic string containing the [`GITHUB_RUN_NUMBER`](https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#about-environment-variables) of the last run that updated the issue. If the run number present in the issue is greater than the local `GITHUB_RUN_NUMBER`, repolinter-action will assume that its results are out of date and will not modify the issue. If the magic string is invalid, not present, or contains a lower run number, repolinter-action will assume its results are up to date and perform its modifications. This magic string is encoded as follows:
```md
<!-- repolinter-action-workflow-number:<GITHUB_RUN_NUMBER> -->
```
