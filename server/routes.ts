import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendContactNotification, initializeEmailService } from "./emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for contact form submissions
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate the request body with zod schema
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      // Add the current timestamp
      const submissionData = {
        ...validatedData,
        createdAt: new Date().toISOString()
      };
      
      // Store the submission
      const newSubmission = await storage.createContactSubmission(submissionData);
      
      // Send email notification
      const emailResult = await sendContactNotification(newSubmission);
      
      // Return success
      res.status(201).json({ 
        message: "Contact submission received successfully",
        submission: newSubmission,
        emailSent: emailResult.success,
        emailMessage: emailResult.message
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          message: "Validation error",
          errors: validationError.details
        });
      } else {
        console.error("Error processing contact submission:", error);
        res.status(500).json({ message: "An error occurred while processing your request" });
      }
    }
  });
  
  // Test email route
  app.get("/api/test-email", async (req: Request, res: Response) => {
    try {
      console.log("Testing email service...");
      
      // Force re-initialization of email service
      await initializeEmailService();
      
      // Create a test submission
      const testSubmission = {
        id: 999,
        name: "Test User",
        email: "test@example.com",
        subject: "Email Test",
        message: "This is a test email to verify that the email service is working correctly.",
        consentGiven: true,
        createdAt: new Date().toISOString()
      };
      
      // Send test email
      console.log("Sending test email...");
      const emailResult = await sendContactNotification(testSubmission);
      
      // Return result
      res.status(200).json({
        message: "Email test completed",
        success: emailResult.success,
        details: emailResult.message
      });
    } catch (error) {
      console.error("Error testing email:", error);
      res.status(500).json({
        message: "Failed to test email service",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
