# Eahtasham Editable Portfolio

A fully customizable Next.js portfolio with an admin panel for live editing. Content is stored dynamically in JSONBin, allowing easy updates without redeployment. The admin panel is secured with email and password authentication.

## Features
- **Next.js + TypeScript** for fast, scalable frontend.
- **Tailwind CSS** for styling.
- **Dynamic content storage** using [JSONBin](https://jsonbin.io/).
- **Admin panel** for editing portfolio sections.
- **EmailJS integration** for contact form.
- **ShadCN UI components** for a sleek interface.

## Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/eahtasham-editable-portfolio.git
cd eahtasham-editable-portfolio

# Install dependencies
npm install

# Run the development server
npm run dev
````

The app will be available at `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file in the root directory and add:

```env
# JSONBin (Required for dynamic portfolio content)
NEXT_PUBLIC_JSONBIN_BIN_ID=your_bin_id_here
NEXT_PUBLIC_JSONBIN_API_KEY=your_jsonbin_api_key_here

# Admin Panel Authentication
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email_here
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password_here
```

> Only the first two variables are required for loading and editing portfolio data. The admin email and password are used for logging into the `/admin` panel.

## Usage

* **Home Page**: Displays portfolio sections like About, Skills, Projects, etc.
* **Admin Panel**: Visit `/admin` and log in using credentials from `.env.local`.
* **Editing**: Modify content in the admin panel and save changes. Updates are instantly reflected via JSONBin.

## Build for Production

```bash
npm run build
npm start
```
