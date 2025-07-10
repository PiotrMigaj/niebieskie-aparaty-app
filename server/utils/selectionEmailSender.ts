import { SendEmailCommand } from "@aws-sdk/client-ses";
import type { SelectionSubmitPayload } from "~~/shared/types/selection.types";
import { getSESClient } from "../config/ses";

export const sendSelectionEmail = async (
  username: string,
  selection: SelectionSubmitPayload
): Promise<void> => {
  const sesClient = getSESClient();

  const now = new Date();
  const localDateTime = now.toLocaleString();

  // Sort the images
  const sortedImages = [...selection.selectedImages].sort();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Potwierdzenie wyboru zdjęć - Niebieskie Aparaty</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            background-color: #f6f6f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 24px 8px;
          }
          .header {
            background-color: #000;
            color: #fff;
            text-align: center;
            padding: 24px 8px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            letter-spacing: 1px;
          }
          .content {
            padding: 16px 0;
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
            font-size: 15px;
          }
          .images-list {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 10px;
          }
          .images-list td {
            background-color: #e9ecef;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
            word-break: break-all;
            margin-bottom: 6px;
            display: block;
            width: 100%;
            box-sizing: border-box;
          }
          .images-list tr {
            display: block;
            margin-bottom: 6px;
          }
          .footer {
            text-align: center;
            font-size: 13px;
            color: #999;
            padding: 16px 8px;
            background-color: #f1f1f1;
          }
          @media (max-width: 600px) {
            .container {
              max-width: 100% !important;
              border-radius: 0;
              box-shadow: none;
              padding: 0 2vw;
            }
            .header {
              padding: 16px 4px;
            }
            .header h1 {
              font-size: 18px;
            }
            .content {
              padding: 8px 0;
            }
            .section h2 {
              font-size: 16px;
            }
            .images-list td {
              font-size: 12px;
              padding: 6px 8px;
            }
            .footer {
              font-size: 12px;
              padding: 10px 4px;
            }
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
              <h2>Wybrane zdjęcia (${sortedImages.length}):</h2>
              <table class="images-list">
                <tbody>
                  ${sortedImages
                    .map(
                      (img) =>
                        `<tr><td>${img}</td></tr>`
                    )
                    .join("")}
                </tbody>
              </table>
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