#!/usr/bin/env node

/**
 * Convert Teacher Manual to HTML for PDF printing
 */

const fs = require('fs');
const path = require('path');

function convertMarkdownToHTML() {
  try {
    // Read the markdown file
    const markdownContent = fs.readFileSync('TEACHER_USER_MANUAL.md', 'utf8');
    
    // Simple markdown to HTML conversion (basic)
    let htmlContent = markdownContent
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
      
      // Line breaks
      .replace(/\n/g, '<br>\n');

    // Wrap in HTML structure
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher User Manual - German Study Buddy</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 25px;
        }
        code {
            background-color: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #3498db;
        }
        ul, ol {
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
        .toc {
            background-color: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        @media print {
            body { font-size: 12px; }
            h1 { page-break-before: always; }
            h2 { page-break-before: avoid; }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

    // Write HTML file
    fs.writeFileSync('TEACHER_USER_MANUAL.html', fullHTML);
    
    console.log('✅ Successfully converted to HTML!');
    console.log('📄 File created: TEACHER_USER_MANUAL.html');
    console.log('');
    console.log('📋 To convert to PDF:');
    console.log('1. Open TEACHER_USER_MANUAL.html in your browser');
    console.log('2. Press Ctrl+P (or Cmd+P on Mac)');
    console.log('3. Select "Save as PDF" as destination');
    console.log('4. Choose "More settings" → "Paper size: A4"');
    console.log('5. Click "Save"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

convertMarkdownToHTML();