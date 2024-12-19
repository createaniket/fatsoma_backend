const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const router = express.Router();
const DropboxToken = require("../Models/DropboxToken"); // Import your model


// Step 1: Redirect user to Dropbox's authorization URL to get the authorization code
router.get("/auth/dropbox", (req, res) => {
  const clientId = process.env.DROPBOX_CLIENT_ID;
  const redirectUri = process.env.DROPBOX_REDIRECT_URI;

  const authorizeUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&token_access_type=offline`;

  console.log("Authorization URL:", authorizeUrl);
  res.redirect(authorizeUrl);
});

// Step 2: Callback route to handle authorization code and get tokens
router.get("/oauth2/callback", async (req, res) => {
  console.log("res ajajs code", req.query.code);
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/oauth2/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.DROPBOX_CLIENT_ID,
        client_secret: process.env.DROPBOX_CLIENT_SECRET,
        redirect_uri: process.env.DROPBOX_REDIRECT_URI,
      })
    );

    console.log("reerererere", response.data);
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    // Store tokens securely in the database
    const tokenRecord = new DropboxToken({
      accessToken,
      refreshToken,
    });
    console.log("theheeheeheheheheheeehehee", tokenRecord);
    await tokenRecord.save(); // Save to the database

    res.send("Authorization successful! Tokens have been saved.");
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.status(500).send("Error getting tokens from Dropbox");
  }
});

// Helper function to check if the access token is expired
async function isAccessTokenExpired(accessToken) {
  try {
    // Make a test request to Dropbox API to check token validity
    const response = await axios.post(
      "https://api.dropboxapi.com/2/check/user",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return false; // If we get a valid response, token is not expired
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // If 401 Unauthorized is returned, the token has expired
      return true;
    }
    throw error; // Other errors (network issues, etc.)
  }
}

// Function to refresh the access token using the refresh token
async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/oauth2/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.DROPBOX_CLIENT_ID,
        client_secret: process.env.DROPBOX_CLIENT_SECRET,
      })
    );

    const accessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token || refreshToken;

    // Update the token record in the database with new tokens
    await DropboxToken.updateOne(
      { refreshToken }, // Find the token record by old refresh token
      {
        accessToken, // New access token
        refreshToken: newRefreshToken, // New refresh token (if provided)
        updatedAt: Date.now(), // Update the timestamp
      }
    );

    return accessToken;
  } catch (error) {
    console.error("Error refreshing Dropbox access token:", error);
    throw new Error("Failed to refresh access token");
  }
}

// // Step 3: Fetch Dropbox files using access token
router.get("/fetch-files", async (req, res) => {
  const AllImages = [];
  console.log("Request Query:", req.query.path);
  const FolderPath = req.query.path || ""; // Default to root folder if path is not provided

  try {
    // Retrieve the most recent Dropbox token record from the database
    const tokenRecord = await DropboxToken.findOne().sort({ createdAt: -1 });

    if (!tokenRecord) {
      return res.status(400).send("Dropbox tokens are not available");
    }

    let accessToken = tokenRecord.accessToken;

    // If the access token is expired, refresh it
    if (await isAccessTokenExpired(accessToken)) {
      accessToken = await refreshAccessToken(tokenRecord.refreshToken);
    }

    console.log("Making API call to Dropbox");
    const response = await axios.post(
      "https://api.dropboxapi.com/2/files/list_folder",
      { path: FolderPath },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Dropbox API Response:", response.data);

    // Save only image links to MongoDB
    const files = response.data.entries.filter(
      (file) => file[".tag"] === "file"
    ); // Filter only files

    for (const file of files) {
      let sharedLink;

      try {
        // Attempt to create a shared link
        const sharedLinkResponse = await axios.post(
          "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
          { path: file.path_lower },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        sharedLink = sharedLinkResponse.data.url;
      } catch (error) {
        if (
          error.response &&
          error.response.data.error[".tag"] === "shared_link_already_exists"
        ) {
          // If shared link already exists, use the existing one
          sharedLink =
            error.response.data.error.shared_link_already_exists.metadata.url;
        } else {
          console.error(
            "Error creating shared link:",
            error.response ? error.response.data : error.message
          );
          continue; // Skip this file if there's an issue
        }
      }

      console.log("The link before modification:", sharedLink);

      // Parse the shared link
      const url = new URL(sharedLink);
      
      // Update the 'dl' parameter to '1' or use 'raw=1' for direct display
      url.searchParams.set("raw", "1"); // Add or replace 'raw' parameter
      url.searchParams.delete("dl");    // Remove 'dl' parameter if present
      
      // Convert the URL object back to a string
      sharedLink = url.toString();
      
      console.log("The link after modification:", sharedLink);
      
      AllImages.push(sharedLink);
    }

    res.json({ message: "Image links stored successfully", files, AllImages });
  } catch (error) {
    console.error(
      "Error fetching files:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("An error occurred");
  }
});

module.exports = router;