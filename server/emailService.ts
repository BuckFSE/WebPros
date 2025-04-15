import nodemailer from 'nodemailer';
import { ContactSubmission } from '@shared/schema';

// Create a test account at ethereal.email for development fallback
async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

// Function to create a transport configuration from environment variables
function createRealEmailConfig() {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS
  } = process.env;
  
  // Check if all required environment variables are set
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('Missing email environment variables. Will use test account instead.');
    return null;
  }
  
  const portNumber = parseInt(EMAIL_PORT);
  const isSecure = portNumber === 465;
  
  // Create config with special settings for Gmail
  const config = {
    host: EMAIL_HOST,
    port: portNumber,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    // Adding Gmail specific requirements
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  };
  
  console.log(`Email config: Using ${EMAIL_HOST}:${EMAIL_PORT} with ${EMAIL_USER}`);
  
  return config;
}

export async function initializeEmailService() {
  try {
    // For simplicity, we'll use a test account from Ethereal Email
    // This is a service that creates temporary email accounts for testing
    console.log('Creating test email account...');
    const testAccountConfig = await createTestAccount();
    const usingTestAccount = true;
    
    transporter = nodemailer.createTransport(testAccountConfig);
    
    console.log('Email service initialized successfully with test account');
    console.log('Test Account Email:', testAccountConfig.auth.user);
    console.log('Test Account Password:', testAccountConfig.auth.pass);
    console.log('View sent emails at: https://ethereal.email/login');
    console.log('NOTE: Use the credentials above to log in and view sent emails');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return false;
  }
}

export async function sendContactNotification(submission: ContactSubmission): Promise<{success: boolean; message: string}> {
  if (!transporter) {
    console.log('Transporter not initialized, attempting to initialize now...');
    await initializeEmailService();
    if (!transporter) {
      console.error('Failed to initialize email transporter');
      return {
        success: false,
        message: 'Email service not initialized'
      };
    }
  }
  
  try {
    // Verify transporter connection
    console.log('Verifying email transport connection...');
    const verifyResult = await transporter.verify();
    console.log('Transport verification result:', verifyResult);
    
    // Build the email content
    const emailContent = `
      New contact form submission:
      
      Name: ${submission.name}
      Email: ${submission.email}
      Subject: ${submission.subject}
      Message: ${submission.message}
      Submitted at: ${submission.createdAt}
    `;
    
    // Configure email options with environment variables
    const from = process.env.EMAIL_FROM || '"Your Website" <no-reply@yourwebsite.com>';
    const to = process.env.EMAIL_TO || 'admin@yourwebsite.com';
    
    console.log(`Sending email from ${from} to ${to}`);
    
    const mailOptions = {
      from: from,
      to: to,
      subject: `New Contact Form Submission: ${submission.subject}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${submission.name}</p>
          <p><strong>Email:</strong> ${submission.email}</p>
          <p><strong>Subject:</strong> ${submission.subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${submission.message.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Submitted at:</strong> ${new Date(submission.createdAt).toLocaleString()}</p>
        </div>
      `
    };
    
    // Send the email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // Only display preview URL for test accounts
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_HOST) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      message: 'Email notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return {
      success: false,
      message: 'Failed to send email notification'
    };
  }
}