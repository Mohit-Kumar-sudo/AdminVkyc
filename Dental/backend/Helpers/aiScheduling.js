const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

/**
 * Suggest optimal appointment times based on treatment type and patient history
 */
async function suggestAppointmentTimes(treatmentType, patientHistory, existingAppointments, preferredDate) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an AI dental practice scheduling assistant. Based on the following information, suggest 3 optimal appointment time slots:

Treatment Type: ${treatmentType}
Patient History: ${JSON.stringify(patientHistory)}
Existing Appointments Today: ${JSON.stringify(existingAppointments)}
Preferred Date: ${preferredDate}

Consider:
1. Treatment duration (cleaning: 30min, filling: 45min, root canal: 90min, crown: 60min, extraction: 45min)
2. Patient's previous appointment patterns
3. Avoiding conflicts with existing appointments
4. Optimal times (morning appointments for complex procedures)

Respond ONLY with a JSON array of 3 time slots in this exact format:
[
  {"time": "09:00", "duration": 30, "reason": "Best for routine procedures"},
  {"time": "10:30", "duration": 30, "reason": "Patient historically prefers mid-morning"},
  {"time": "14:00", "duration": 30, "reason": "Afternoon alternative"}
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return suggestions;
    }
    
    // Fallback suggestions if AI fails
    return [
      { time: "09:00", duration: 30, reason: "Morning appointment available" },
      { time: "11:00", duration: 30, reason: "Late morning slot" },
      { time: "14:00", duration: 30, reason: "Afternoon appointment" }
    ];
  } catch (error) {
    console.error('AI scheduling error:', error);
    // Return fallback suggestions
    return [
      { time: "09:00", duration: 30, reason: "Morning appointment available" },
      { time: "11:00", duration: 30, reason: "Late morning slot" },
      { time: "14:00", duration: 30, reason: "Afternoon appointment" }
    ];
  }
}

/**
 * Predict follow-up appointment needs based on treatment
 */
async function suggestFollowUp(treatmentType, completedDate) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a dental scheduling AI, suggest a follow-up appointment for:
Treatment: ${treatmentType}
Completed Date: ${completedDate}

Consider standard dental follow-up protocols.
Respond ONLY with JSON in this exact format:
{
  "recommended": true,
  "daysAfter": 14,
  "reason": "Follow-up check required for root canal"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback based on treatment type
    const followUpMap = {
      'root-canal': { recommended: true, daysAfter: 14, reason: 'Post-treatment check required' },
      'extraction': { recommended: true, daysAfter: 7, reason: 'Healing check recommended' },
      'crown': { recommended: true, daysAfter: 30, reason: 'Crown adjustment check' },
      'filling': { recommended: true, daysAfter: 180, reason: 'Regular checkup in 6 months' },
      'cleaning': { recommended: true, daysAfter: 180, reason: 'Next cleaning in 6 months' }
    };
    
    return followUpMap[treatmentType] || { recommended: false, daysAfter: 180, reason: 'Regular checkup' };
  } catch (error) {
    console.error('Follow-up suggestion error:', error);
    return { recommended: true, daysAfter: 180, reason: 'Regular checkup in 6 months' };
  }
}

/**
 * Analyze patient patterns for predictive scheduling
 */
async function analyzePatientPatterns(patientAppointments) {
  try {
    if (!patientAppointments || patientAppointments.length === 0) {
      return { preferredTime: "09:00", preferredDay: "weekday", pattern: "No history" };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this patient's appointment history and identify patterns:
${JSON.stringify(patientAppointments)}

Identify:
1. Preferred time of day (morning/afternoon/evening)
2. Preferred day of week
3. Cancellation patterns
4. Any notable scheduling preferences

Respond ONLY with JSON:
{
  "preferredTime": "morning",
  "preferredDay": "weekday",
  "pattern": "Patient prefers morning appointments on weekdays"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { preferredTime: "09:00", preferredDay: "weekday", pattern: "Based on history" };
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return { preferredTime: "09:00", preferredDay: "weekday", pattern: "Default preference" };
  }
}

/**
 * Generate smart reminder message based on appointment details
 */
async function generateReminderMessage(appointmentDetails) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a friendly appointment reminder message for:
Patient: ${appointmentDetails.patientName}
Treatment: ${appointmentDetails.treatmentType}
Date: ${appointmentDetails.date}
Time: ${appointmentDetails.time}
Doctor: ${appointmentDetails.doctorName}

Create a warm, professional reminder with:
1. Greeting
2. Appointment details
3. Any preparation needed
4. Contact info

Keep it under 150 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Reminder generation error:', error);
    return `Hi ${appointmentDetails.patientName}, this is a reminder of your appointment on ${appointmentDetails.date} at ${appointmentDetails.time} with Dr. ${appointmentDetails.doctorName} for ${appointmentDetails.treatmentType}. Please arrive 10 minutes early. Contact us if you need to reschedule.`;
  }
}

module.exports = {
  suggestAppointmentTimes,
  suggestFollowUp,
  analyzePatientPatterns,
  generateReminderMessage
};
