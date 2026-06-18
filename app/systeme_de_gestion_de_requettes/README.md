# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Architecture et communication des technologies

Cette application utilise les technologies suivantes dans le dossier `client/systeme_de_gestion_de_requettes` :

- `React` : couche UI et logique de rendu.
- `react-router-dom` : navigation dans l'application en mode SPA.
- `Axios` : client HTTP pour communiquer avec le backend.
- `Tailwind CSS` + `DaisyUI` : styles utilitaires et composants d'interface.

### Comment elles communiquent

1. `App.js` et `react-router-dom`
   - `App.js` configure les routes avec `BrowserRouter`, `Routes` et `Route`.
   - Chaque page (`Home`, `Dashboard`, `Login`, `Register`, `Request`, `Tracking`, `Docs`) est une vue indépendante.

2. Pages React et Axios
   - Les pages et composants utilisent Axios pour demander des données au backend.
   - Le fichier `src/api.js` centralise la configuration d'Axios.
   - Exemple : `api.get('/requetes')`, `api.post('/auth/login', data)`.

3. Backend et base URL
   - Le backend doit exposer des endpoints REST ou des routes API.
   - `src/api.js` utilise `REACT_APP_API_BASE_URL` si défini, sinon `http://localhost:8000`.
   - Crée un fichier `.env` à la racine du client si besoin :
     ```env
     REACT_APP_API_BASE_URL=http://localhost:8000
     ```

4. Tailwind CSS + DaisyUI
   - Tailwind transforme les classes utilitaires dans les fichiers `src/**/*.{js,jsx,ts,tsx}`.
   - DaisyUI fournit des classes de composants (`btn`, `card`, `input`, `navbar`, etc.).
   - Utilise les classes Tailwind/DaisyUI directement dans les composants React.

### Bonnes pratiques pour bien travailler

- Range la logique API dans `src/api.js` puis appelle-la depuis les pages.
- Garde les pages simples : récupération des données, gestion d'état local, rendu JSX.
- Utilise les composants réutilisables pour les formulaires, les boutons et les cartes.
- Place les styles optionnels dans `src/App.css` ou via des classes Tailwind.
- Si tu veux ajouter des routes protégées, crée une route privée autour de `react-router-dom`.

### Exemple de flux

1. L'utilisateur clique sur un lien ou une route.
2. `react-router-dom` affiche la page correspondante.
3. La page appelle `api.get(...)` ou `api.post(...)`.
4. Axios envoie la requête au backend.
5. Le backend répond avec des données JSON.
6. React met à jour l'UI avec les données reçues.
