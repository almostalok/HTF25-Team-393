
# Welcome to "saaarthi"

saaarthi (Interactive Urban Issue Reporter) empowers citizens to report civic problems such as potholes, broken streetlights, or vandalism directly to local authorities. Users can geo-tag issues, attach images, provide descriptions, and track status. Authorities can respond and update status to ensure transparency and accountability.

## Demo deployment
deployment link:


## How can I edit this code?

There are several ways of editing your application.


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. 

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

Auth in this demo is local-only: logging in stores a simple object in localStorage (key `saarthi_auth`) with shape { role, name, token } and is used to protect dashboard routes. Use the Landing page to sign in as a citizen or authority for quick testing.

## How can I deploy this project?
use vercel

##Deployment link
https://citizen-connect-saarthi-hub-fuzr.vercel.app/

