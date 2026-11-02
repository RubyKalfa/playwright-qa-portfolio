# Publish to GitHub

The project is published at https://github.com/RubyKalfa/playwright-qa-portfolio. The instructions below explain how to publish your own copy or recreate the repository.

## GitHub Desktop

1. Extract the project ZIP if needed and open GitHub Desktop.
2. Choose **File → Add local repository** and select the `playwright-qa-portfolio` folder. If prompted, create a repository in that folder. Avoid adding an extra nested folder.
3. Review the files. `node_modules`, generated reports, and local environment files should not appear.
4. Commit with a message such as `Add Playwright UI and API portfolio`.
5. Choose **Publish repository**, name it `playwright-qa-portfolio`, and choose visibility. A public repository is easiest for recruiters to review.
6. Open its **Actions** tab and check the first run. Download the `playwright-results` artifact to inspect the report.
7. Pin the repository to your profile and add its real URL to your CV.

## Command line alternative

Create an empty repository on GitHub first, without an initial README. Run these commands inside the extracted project folder:

```sh
git init -b main
git add .
git commit -m "Add Playwright UI and API portfolio"
```

Copy the remote URL from your own GitHub repository, then run `git remote add origin YOUR_REPOSITORY_URL` and `git push -u origin main`, substituting the actual URL. GitHub may ask you to sign in. Never commit a token or password.

## Suggested repository description

Playwright and TypeScript QA portfolio with UI and REST API tests, cross-browser coverage, isolated fixtures, failure recovery, and GitHub Actions.

## Before sending it to a recruiter

- Run the tests yourself and inspect the report.
- Read the walkthrough and explain one test from setup to cleanup.
- Make a small improvement you understand, such as an additional negative API case.
- Confirm GitHub Actions is green on the published commit.
- Describe it as a personal portfolio project, with no employer association.
