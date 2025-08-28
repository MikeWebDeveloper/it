// Web Worker for parsing large JSON files without blocking the main thread
self.onmessage = function(e) {
  const { type, data, chunkSize = 50 } = e.data;

  try {
    switch (type) {
      case 'PARSE_QUESTIONS':
        // Parse questions in chunks
        const questions = data.questions || [];
        const chunks = [];
        
        for (let i = 0; i < questions.length; i += chunkSize) {
          chunks.push(questions.slice(i, i + chunkSize));
        }

        // Send progress updates as we process chunks
        chunks.forEach((chunk, index) => {
          // Simulate processing time and send progress
          setTimeout(() => {
            self.postMessage({
              type: 'CHUNK_PROCESSED',
              chunk: chunk,
              progress: ((index + 1) / chunks.length) * 100,
              chunkIndex: index,
              totalChunks: chunks.length
            });
          }, index * 10); // Small delay to keep UI responsive
        });

        // Send completion message
        setTimeout(() => {
          self.postMessage({
            type: 'PARSING_COMPLETE',
            totalQuestions: questions.length,
            totalChunks: chunks.length,
            exam_info: data.exam_info
          });
        }, chunks.length * 10);
        break;

      case 'FILTER_BY_TOPIC':
        // Filter questions by topic
        const filteredQuestions = data.questions.filter(q => 
          q.topic && q.topic.toLowerCase().includes(data.topic.toLowerCase())
        );
        
        self.postMessage({
          type: 'TOPIC_FILTERED',
          questions: filteredQuestions,
          topic: data.topic,
          count: filteredQuestions.length
        });
        break;

      case 'SEARCH_QUESTIONS':
        // Search questions by keyword
        const searchResults = data.questions.filter(q => {
          const searchText = data.searchTerm.toLowerCase();
          return (
            q.question?.toLowerCase().includes(searchText) ||
            q.topic?.toLowerCase().includes(searchText) ||
            q.choices?.some(choice => choice.toLowerCase().includes(searchText))
          );
        });

        self.postMessage({
          type: 'SEARCH_RESULTS',
          questions: searchResults,
          searchTerm: data.searchTerm,
          count: searchResults.length
        });
        break;

      default:
        self.postMessage({
          type: 'ERROR',
          message: `Unknown message type: ${type}`
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      message: error.message,
      stack: error.stack
    });
  }
};

// Handle worker errors
self.onerror = function(error) {
  self.postMessage({
    type: 'ERROR',
    message: error.message,
    filename: error.filename,
    lineno: error.lineno
  });
};