"use server";

import { z } from "zod";
import axios from "axios";
import sharp from "sharp";

const githubToken = process.env.GITHUB_TOKEN || ""; // Replace with your GitHub PAT
const githubUsername = process.env.GITHUB_USERNAME || ""; // Replace with your GitHub username

// Sub-function 1: Create PWA files and return their content
async function createPWAFiles(validatedData: any) {
  // Create index.html with an embedded iframe
  const indexHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="theme-color" content="${validatedData.themeColor}">
      <title>${validatedData.name}</title>
      <link rel="manifest" href="manifest.json" />
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        embed {
          width: 100vw;
          height: 100vh;
        }
      </style>
    </head>
    <body>
        <embed type="text/html" src="${validatedData.url}" />
    </body>
    </html>
  `;

  // Create manifest.json
  const manifestContent = {
    name: validatedData.name,
    short_name: validatedData.name,
    start_url: "./index.html",
    display: "standalone",
    background_color: validatedData.themeColor,
    theme_color: validatedData.themeColor,
    icons: validatedData.icon
      ? [
          {
            src: validatedData.icon.name,
            sizes: "192x192",
            type: "image/png",
          },
        ]
      : [],
  };

  const files = [
    { path: "index.html", content: indexHtmlContent },
    { path: "manifest.json", content: JSON.stringify(manifestContent, null, 2) },
  ];

  // If an icon was uploaded, resize and convert it to base64
  if (validatedData.icon) {
    const iconBuffer = await validatedData.icon.arrayBuffer();
    const resizedIconBuffer = await sharp(Buffer.from(iconBuffer))
      .resize(192, 192, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
    files.push({
      path: validatedData.icon.name,
      content: resizedIconBuffer.toString("base64"),
    });
  }

  return files;
}

// Sub-function 2: Create a new GitHub repository
async function createGitHubRepo(repoName: string) {
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      {
        name: repoName,
        private: false, // Set to true for private repositories
        auto_init: false, // Do not initialize with a README
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    return {
      success: true,
      repoUrl: response.data.html_url,
      cloneUrl: response.data.clone_url,
    };
  } catch (error) {
    console.error("Error creating GitHub repository:", error);
    return {
      success: false,
      error: "Failed to create GitHub repository.",
    };
  }
}

// Sub-function 3: Push files to the GitHub repository
async function pushFilesToRepo(repoName: string, files: { path: string; content: string }[]) {
  try {
    for (const file of files) {
      const response = await axios.put(
        `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${file.path}`,
        {
          message: `Add ${file.path}`,
          content: Buffer.from(file.content).toString("base64"),
        },
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      console.log(`File ${file.path} created:`, response.data);
    }

    return true;
  } catch (error) {
    console.error("Error pushing files to GitHub:", error);
    return false;
  }
}

// Sub-function 4: Enable GitHub Pages for the repository
async function enableGitHubPages(repoName: string) {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${githubUsername}/${repoName}/pages`,
      {
        source: {
          branch: "main", // Set the branch to 'main' or 'gh-pages'
          path: "/", // Serve from the root of the branch
        },
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    return {
      success: true,
      pagesUrl: response.data.html_url, // GitHub Pages URL
    };
  } catch (error) {
    console.error("Error enabling GitHub Pages:", error);
    return {
      success: false,
      error: "Failed to enable GitHub Pages.",
    };
  }
}

const formSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  icon: z
    .instanceof(File)
    .refine((file) => file.type === "image/png", {
      message: "Only PNG files are allowed",
    })
    .optional(),
});

export async function convertToPWA(formData: FormData) {
  // Extract and validate the form data
  const url = formData.get("url") as string;
  const name = formData.get("name") as string;
  const themeColor = formData.get("themeColor") as string;
  const icon = formData.get("icon") as File | null;

  const validatedData = formSchema.parse({ url, name, themeColor, icon });

  // Step 1: Create PWA files
  const files = await createPWAFiles(validatedData);

  // Step 2: Create a new GitHub repository
  const repoName = `${validatedData.name
    .toLowerCase()
    .replace(/\s+/g, "-")}-pwa`;

  const repoCreationResult = await createGitHubRepo(repoName);

  if (!repoCreationResult.success) {
    return {
      success: false,
      error: repoCreationResult.error,
    };
  }

  // Step 3: Push files to the new repository
  const pushResult = await pushFilesToRepo(repoName, files);

  if (!pushResult) {
    return {
      success: false,
      error: "Failed to push files to GitHub repository.",
    };
  }

  // Step 4: Enable GitHub Pages
  const pagesResult = await enableGitHubPages(repoName);

  if (!pagesResult.success) {
    return {
      success: false,
      error: pagesResult.error,
    };
  }

  // Return the PWA URL
  return {
    success: true,
    pwaUrl: pagesResult.pagesUrl,
    files: files,
  };
}