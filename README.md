# midterm-todoList
# Country Wishlist - Vue 3 + Supabase

This application allows users to create and manage a **wishlist** of countries they would like to visit. Users can **add**, **edit**, **mark as visited/unvisited**, and **delete** countries from their personal wishlist. The app is built using **Vue 3**, state management is handled with **Pinia**, and **Supabase** is used for the backend and database. The application is deployed on **Vercel**.

## Key Features

- **User Authentication** (Sign up, Log in, Log out) using Supabase.
- **Personalized wishlist** for each user that includes:
  - Adding countries to the wishlist.
  - Editing country details.
  - Marking countries as **visited** or **unvisited**.
  - Deleting countries from the list.
- **Clean and functional UI** styled using **Bulma**.
- **Global state management** using **Pinia**.
- Fully integrated **CRUD operations** (Create, Read, Update, Delete) with Supabase.

## Technologies Used

- **Vue 3**: A JavaScript framework used for building the user interface.
- **Pinia**: State management library for Vue.js.
- **Supabase**: Backend-as-a-service platform used for managing authentication and database CRUD operations.
- **Vite**: A modern build tool that optimizes project development and builds.
- **Bulma**: CSS framework used to style the UI.
- **Vercel**: Cloud deployment platform where the app is hosted.

## Project Requirements

- **GitHub Repository**: The source code is versioned and hosted on GitHub.
- **Online Deployment**: The application is deployed on **Vercel** and accessible through a public URL.
- **Development Best Practices**:
  - The app follows the **KISS** (Keep It Simple, Stupid) and **DRY** (Don’t Repeat Yourself) principles.
  - All code is structured and clean to facilitate maintenance and scalability.

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or above) is required.
- [Git](https://git-scm.com/) should be installed for version control.

### Installation

Clone this repository and navigate to the project directory:

```sh
git clone https://github.com/yourusername/your-repository.git
cd your-repository
```

Install the project dependencies:
```sh
npm install
```

Compile and Run for Development
To start the development server, run:
```sh
npm run dev
```
This will open the app at http://localhost:3000 in your browser.


## Deployment

The project is deployed on **Vercel**. You can access the live version of the application at the following link:

[Link to the live application on Vercel](https://midterm-todo-list.vercel.app/)

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-new-feature`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push your branch (`git push origin feature-new-feature`).
5. Open a **Pull Request**.


