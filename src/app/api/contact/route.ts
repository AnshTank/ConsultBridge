import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Contact from '../../../models/Contact';

export async function POST(request: NextRequest) {
  try {
    const contactData = await request.json();

    // Validate required fields
    const { name, email, userType, inquiryType, subject, message } = contactData;
    
    if (!name || !email || !userType || !inquiryType || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new contact entry
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: contactData.phone?.trim() || '',
      company: contactData.company?.trim() || '',
      userType,
      inquiryType,
      subject: subject.trim(),
      message: message.trim(),
      priority: contactData.priority || 'Medium',
      preferredContactMethod: contactData.preferredContactMethod || 'Email'
    });

    await contact.save();

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      contactId: contact._id.toString()
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}