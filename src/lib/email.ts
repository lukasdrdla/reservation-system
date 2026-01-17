import { Resend } from 'resend';
import type { Booking, Service, Tenant } from './types';
import { formatDate, formatTime, formatPrice } from './utils';

// Lazy initialization - vytvoří klienta až při prvním použití
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface EmailData {
  booking: Booking;
  service: Service;
  tenant: Tenant;
}

// Potvrzení rezervace pro zákazníka
export async function sendBookingConfirmation({ booking, service, tenant }: EmailData) {
  const resend = getResendClient();
  if (!resend) {
    console.log('RESEND_API_KEY není nastaven, email nebyl odeslán');
    return { success: false, error: 'API key not configured' };
  }

  const endTime = calculateEndTime(booking.start_time, service.duration);

  try {
    const { data, error } = await resend.emails.send({
      from: `${tenant.name} <onboarding@resend.dev>`, // V produkci použijte vlastní doménu
      to: booking.customer_email,
      subject: `Potvrzení rezervace - ${tenant.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Potvrzení rezervace</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: ${tenant.primary_color || '#0066FF'}; padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                        Rezervace potvrzena ✓
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.5;">
                        Dobrý den <strong>${booking.customer_name}</strong>,
                      </p>
                      <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.5;">
                        vaše rezervace byla úspěšně potvrzena. Níže najdete všechny detaily.
                      </p>

                      <!-- Reservation Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom: 16px;">
                                  <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Služba</p>
                                  <p style="margin: 4px 0 0; color: #333; font-size: 18px; font-weight: 600;">${service.name}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 16px;">
                                  <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Datum</p>
                                  <p style="margin: 4px 0 0; color: #333; font-size: 18px; font-weight: 600;">📅 ${formatDate(booking.date)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 16px;">
                                  <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Čas</p>
                                  <p style="margin: 4px 0 0; color: #333; font-size: 18px; font-weight: 600;">🕐 ${formatTime(booking.start_time)} - ${formatTime(endTime)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Cena</p>
                                  <p style="margin: 4px 0 0; color: #333; font-size: 18px; font-weight: 600;">💰 ${formatPrice(service.price)}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      ${booking.note ? `
                      <p style="margin: 0 0 24px; color: #666; font-size: 14px;">
                        <strong>Vaše poznámka:</strong> ${booking.note}
                      </p>
                      ` : ''}

                      <p style="margin: 0 0 8px; color: #333; font-size: 14px;">
                        <strong>Potřebujete změnit termín?</strong>
                      </p>
                      <p style="margin: 0 0 24px; color: #666; font-size: 14px;">
                        Kontaktujte nás na
                        ${tenant.phone ? `<a href="tel:${tenant.phone}" style="color: ${tenant.primary_color || '#0066FF'};">${tenant.phone}</a> nebo ` : ''}
                        <a href="mailto:${tenant.email}" style="color: ${tenant.primary_color || '#0066FF'};">${tenant.email}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0; color: #999; font-size: 14px;">
                        ${tenant.name}
                      </p>
                      <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
                        Tento email byl vygenerován automaticky, neodpovídejte na něj.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Notifikace pro provozovatele o nové rezervaci
export async function sendBookingNotification({ booking, service, tenant }: EmailData) {
  const resend = getResendClient();
  if (!resend) {
    console.log('RESEND_API_KEY není nastaven, email nebyl odeslán');
    return { success: false, error: 'API key not configured' };
  }

  const endTime = calculateEndTime(booking.start_time, service.duration);

  try {
    const { data, error } = await resend.emails.send({
      from: `Rezervační systém <onboarding@resend.dev>`,
      to: tenant.email,
      subject: `Nová rezervace - ${booking.customer_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #10B981; padding: 24px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                        🔔 Nová rezervace
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <!-- Customer Info -->
                        <tr>
                          <td style="padding-bottom: 24px; border-bottom: 1px solid #eee;">
                            <h2 style="margin: 0 0 16px; color: #333; font-size: 16px;">Zákazník</h2>
                            <p style="margin: 0 0 8px; color: #333; font-size: 16px;">
                              <strong>${booking.customer_name}</strong>
                            </p>
                            <p style="margin: 0 0 4px; color: #666; font-size: 14px;">
                              📧 <a href="mailto:${booking.customer_email}" style="color: #0066FF;">${booking.customer_email}</a>
                            </p>
                            <p style="margin: 0; color: #666; font-size: 14px;">
                              📱 <a href="tel:${booking.customer_phone}" style="color: #0066FF;">${booking.customer_phone}</a>
                            </p>
                          </td>
                        </tr>

                        <!-- Booking Info -->
                        <tr>
                          <td style="padding: 24px 0;">
                            <h2 style="margin: 0 0 16px; color: #333; font-size: 16px;">Detaily rezervace</h2>
                            <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px;">
                              <tr>
                                <td style="color: #666; font-size: 14px; width: 100px;">Služba:</td>
                                <td style="color: #333; font-size: 14px; font-weight: 600;">${service.name}</td>
                              </tr>
                              <tr>
                                <td style="color: #666; font-size: 14px;">Datum:</td>
                                <td style="color: #333; font-size: 14px; font-weight: 600;">${formatDate(booking.date)}</td>
                              </tr>
                              <tr>
                                <td style="color: #666; font-size: 14px;">Čas:</td>
                                <td style="color: #333; font-size: 14px; font-weight: 600;">${formatTime(booking.start_time)} - ${formatTime(endTime)}</td>
                              </tr>
                              <tr>
                                <td style="color: #666; font-size: 14px;">Cena:</td>
                                <td style="color: #333; font-size: 14px; font-weight: 600;">${formatPrice(service.price)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        ${booking.note ? `
                        <tr>
                          <td style="padding-top: 16px; border-top: 1px solid #eee;">
                            <h2 style="margin: 0 0 8px; color: #333; font-size: 16px;">Poznámka od zákazníka</h2>
                            <p style="margin: 0; color: #666; font-size: 14px; background-color: #fffbeb; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                              ${booking.note}
                            </p>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 24px; background-color: #f8f9fa; text-align: center;">
                      <p style="margin: 0; color: #999; font-size: 12px;">
                        Rezervační systém DevStudio
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Notification email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Notification email send error:', error);
    return { success: false, error };
  }
}

// Helper function
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}
