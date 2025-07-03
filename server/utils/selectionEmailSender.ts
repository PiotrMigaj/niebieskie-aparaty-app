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
          .images-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px 6px;
            margin-top: 10px;
          }
          .images-table td {
            background-color: #e9ecef;
            padding: 6px 6px;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
            min-width: 80px;
            max-width: 120px;
            word-break: break-all;
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
            .images-table td {
              font-size: 12px;
              min-width: 60px;
              max-width: 80px;
              padding: 4px 2px;
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
              <h2>Wybrane zdjęcia (${selection.selectedImages.length}):</h2>
              <table class="images-table">
                <tbody>
                  ${
                    (() => {
                      // On mobile, use 2 columns, otherwise 4
                      // But since email clients don't support JS, we must use a single layout.
                      // So, use 2 columns for better mobile scaling.
                      const cols = 2;
                      const rows = [];
                      for (let i = 0; i < selection.selectedImages.length; i += cols) {
                        const rowImgs = selection.selectedImages.slice(i, i + cols);
                        rows.push(
                          `<tr>${rowImgs
                            .map(
                              (img) =>
                                `<td>${img}</td>`
                            )
                            .join("")}${rowImgs.length < cols
                              ? "<td colspan='" + (cols - rowImgs.length) + "'></td>"
                              : ""}</tr>`
                        );
                      }
                      return rows.join("");
                    })()
                  }
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
