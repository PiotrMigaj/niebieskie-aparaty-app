import { SendEmailCommand } from "@aws-sdk/client-ses";
import type { SelectionSubmitPayload } from "~~/types/selection.types";
import { getSESClient } from "./ses";

export const sendSelectionEmail = async (
  username: string,
  selection: SelectionSubmitPayload
): Promise<void> => {
  const sesClient = getSESClient();

  const now = new Date();
  const localDateTime = now.toLocaleString();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Potwierdzenie wyboru zdjęć - Niebieskie Aparaty</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            background-color: #f6f6f6;
            margin: 0;
            padding: 40px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #000;
            color: #fff;
            text-align: center;
            padding: 30px 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            letter-spacing: 1px;
          }
          .content {
            padding: 30px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section h2 {
            font-size: 18px;
            color: #000;
            margin-bottom: 10px;
          }
          .section p {
            margin: 0;
            font-size: 14px;
          }
          .images {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .image {
            background-color: #e9ecef;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 13px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            padding: 20px;
            background-color: #f1f1f1;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nowy wybór zdjęć od ${username}</h1>
          </div>
          <div class="content">
            <div class="section">
              <h2>Dane wyboru:</h2>
              <p><strong>Data wyboru:</strong> ${localDateTime}</p>
              <p><strong>Selection ID:</strong> ${selection.selectionId}</p>
              <p><strong>Event ID:</strong> ${selection.eventId}</p>
              <p><strong>Tytuł wydarzenia:</strong> ${selection.eventTitle}</p>
            </div>
            <div class="section">
              <h2>Wybrane zdjęcia (${selection.selectedImages.length}):</h2>
              <div class="images">
                ${selection.selectedImages
                  .map((img) => `<div class="image">${img}</div>`)
                  .join("")}
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Wiadomość wygenerowana automatycznie przez system Niebieskie Aparaty.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const params = {
    Source: "Niebieskie Aparaty <kozlowska0705@gmail.com>",
    Destination: {
      ToAddresses: ["kozlowska0705@gmail.com", "pmigaj@gmail.com"],
    },
    Message: {
      Subject: {
        Data: `Nowy wybór zdjęć od ${username}`,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: "UTF-8",
        },
      },
    },
  };

  await sesClient.send(new SendEmailCommand(params));
};
