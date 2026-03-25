import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDownAlert(params: {
  to: string;
  monitorName: string;
  url: string;
  error?: string;
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: params.to,
    subject: `[DOWN] ${params.monitorName} is not responding`,
    html: `
      <h2>${params.monitorName} is down</h2>
      <p>URL: <a href="${params.url}">${params.url}</a></p>
      ${params.error ? `<p>Error: ${params.error}</p>` : ""}
      <p>We'll notify you when it's back up.</p>
    `,
  });
}

export async function sendUpAlert(params: {
  to: string;
  monitorName: string;
  url: string;
  downtime: string;
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: params.to,
    subject: `[UP] ${params.monitorName} is back online`,
    html: `
      <h2>${params.monitorName} is back up</h2>
      <p>URL: <a href="${params.url}">${params.url}</a></p>
      <p>Downtime: ${params.downtime}</p>
    `,
  });
}
