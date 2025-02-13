import React from "react";
import { Button } from "@mui/material";
import { PageControllerApiFactory } from "../../api";

export default function PageSetting() {
  const handleCleanTitles = async () => {
    try {
      await PageControllerApiFactory().cleanPageTitlesUsingPOST();
      alert("Page titles cleaned successfully");
    } catch (error) {
      console.error("Error cleaning page titles:", error);
      alert("Failed to clean page titles");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Page Settings</h2>
      <div className="space-y-4">
        <div>
          <Button 
            variant="contained" 
            onClick={handleCleanTitles}
            className="bg-blue-600"
          >
            Clean Page Titles
          </Button>
        </div>
      </div>
    </div>
  );
}
