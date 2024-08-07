# Quick Start Guide
## 1. Clone the repository
Use your Git client of choice, or if you don't know any of them, do it my way:
- Open Command Prompt.
- `git clone https://github.com/homeworkace/khanfused`
  - If your computer can't find `git`, download Git.

## 2. Run the server
- Open Command Prompt.
- `cd` to your working directory (the directory where this README is).
- `cd server` brings your Command Prompt to the server folder.
- Check your Python version with `py -3.12`. If your computer can't find it, download Python 3.12.
- The server runs on a virtual environment made just for it. `pipenv` maintains that environment. `py -3.12 -m pip install pipenv`
- `pipenv install` to install all the dependencies written in the provided `Pip.lock` file into the environment.
  - Periodically run this command as more dependencies are added to the project.
- `pipenv shell` to enter this virtual environment.
  - `exit` to leave.
- When in the environment, `python server.py` to start the server.
  - Ctrl+C to stop.

## 3. Run the frontend
- Open another Command Prompt.
- `cd ..` to go up one level.
- `cd khanfused` to go down the frontend folder.
- `npm install` to install all the dependencies written in the provided `package.json` file into the directory.
  - If your computer can't find `npm`, download React.
  - Periodically run this command as more dependencies are added to the project.
- When the server is running, `npm start` to start the React framework.
  - Ctrl+C to stop.
 
## 4. Receive and make changes
- `git pull` updates your local copy of the repository with new changes from the one on GitHub (remote).
- `git add *` stages all your changes.
  - If for some reason you want to control which files go to GitHub, use `git add ` followed by the relative path of your file/folder.
- `git commit` makes... a commit based on your staged changes.
  - It's good courtesy to pace your commits around the completion of each feature, and to make sure your project actually runs before you commit.
  - Commits need messages: a description of what you did. Add this with `git commit -m "Your message"`, because if you don't, you get thrown into a Vim interface just to write that message, which is very hard to get out of. Kind of like detention for not doing your homework (commit message)...
- `git push` to send your changes to GitHub.
  - You must always commit, then pull, before you push.
  - When pulling, Git automatically merges your changes (from your commit) with all the changes that are introduced with the pull. This typically happens without issue, unless two of you edit the same line of code... then you get a _merge conflict_. Resolving them is an art form which I CBA to write about here,
- `git branch` to switch to a different branch of development.

## 5. Just ask Rick
You're guaranteed a response within 30 minutes on Mondays and Thursdays, from 9 to 6. I'm contactable at other times, but don't expect quick replies.
