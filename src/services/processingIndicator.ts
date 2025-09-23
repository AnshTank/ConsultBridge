interface ProcessingTask {
  id: string;
  message: string;
  startTime: Date;
  estimatedDuration: number; // in milliseconds
  onComplete?: (result: any) => void;
}

export class ProcessingIndicator {
  private activeTasks: Map<string, ProcessingTask> = new Map();

  async executeWithProgress<T>(
    taskId: string,
    message: string,
    estimatedDuration: number,
    task: () => Promise<T>,
    onProgress?: (progress: string) => void
  ): Promise<T> {
    
    // Start processing indication
    this.startTask(taskId, message, estimatedDuration);
    
    if (onProgress) {
      onProgress(`⏳ ${message}...`);
    }

    try {
      // Show progress updates for longer tasks
      let progressInterval: NodeJS.Timeout | null = null;
      
      if (estimatedDuration > 2000) {
        let dots = 0;
        progressInterval = setInterval(() => {
          dots = (dots + 1) % 4;
          const dotString = '.'.repeat(dots);
          if (onProgress) {
            onProgress(`⏳ ${message}${dotString}`);
          }
        }, 500);
      }

      // Execute the actual task
      const result = await task();
      
      // Clear progress indicator
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      this.completeTask(taskId);
      
      if (onProgress) {
        onProgress(`✅ Done!`);
      }
      
      return result;
      
    } catch (error) {
      this.completeTask(taskId);
      if (onProgress) {
        onProgress(`❌ Something went wrong. Let me try again.`);
      }
      throw error;
    }
  }

  private startTask(id: string, message: string, estimatedDuration: number) {
    this.activeTasks.set(id, {
      id,
      message,
      startTime: new Date(),
      estimatedDuration
    });
  }

  private completeTask(id: string) {
    this.activeTasks.delete(id);
  }

  getProcessingMessage(actionType: string): { message: string; duration: number } {
    const messages = {
      'search': { message: 'Finding the best consultants for you', duration: 3000 },
      'booking': { message: 'Setting up your appointment', duration: 2000 },
      'problem_solving': { message: 'Analyzing your situation', duration: 1500 },
      'ai_analysis': { message: 'Processing with AI', duration: 4000 },
      'consultant_match': { message: 'Matching you with experts', duration: 2500 }
    };

    return (messages as any)[actionType] || { message: 'Processing your request', duration: 1000 };
  }
}