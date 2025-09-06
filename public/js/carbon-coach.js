/**
 * Carbon Coach JavaScript
 * Handles form submission, file uploads, and dynamic UI updates
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const carbonForm = document.getElementById('carbon-form');
  const fileUpload = document.getElementById('file-upload');
  const uploadStatus = document.getElementById('upload-status');
  const resultsSection = document.getElementById('results-section');
  const carbonScore = document.getElementById('carbon-score');
  const comparisonText = document.getElementById('comparison-text');
  const chartCanvas = document.getElementById('carbon-chart');
  const recommendationsList = document.getElementById('recommendations-list');
  const saveButton = document.getElementById('save-button');
  const shareButton = document.getElementById('share-button');
  
  // Chart instance
  let carbonChart = null;
  
  // Handle file upload
  if (fileUpload) {
    fileUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      // Update UI to show upload in progress
      uploadStatus.textContent = `Uploading ${file.name}...`;
      uploadStatus.style.display = 'block';
      
      // Clear form fields as we'll get values from the bill
      document.getElementById('electricity').value = '';
    });
  }
  
  // Handle form submission
  if (carbonForm) {
    carbonForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Show loading state
      const submitButton = carbonForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Calculating...';
      submitButton.disabled = true;
      
      // Create FormData object
      const formData = new FormData();
      
      // Add file if present
      if (fileUpload && fileUpload.files[0]) {
        formData.append('bill', fileUpload.files[0]);
      }
      
      // Add form fields
      formData.append('electricity', document.getElementById('electricity').value || '0');
      formData.append('natural_gas', document.getElementById('natural-gas').value || '0');
      formData.append('water', document.getElementById('water').value || '0');
      formData.append('waste', document.getElementById('waste').value || '0');
      formData.append('transportation', document.getElementById('transportation').value || '0');
      formData.append('household_size', document.getElementById('household-size').value || '1');
      formData.append('region', document.getElementById('region').value || 'Other');
      
      // Send data to server
      fetch('../../api/carbon/calculate', {
        method: 'POST',
        body: formData,
        // No Content-Type header needed as FormData sets it automatically with boundary
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Reset UI states
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        uploadStatus.style.display = 'none';
        
        // Display results
        displayResults(data);
        
        // Scroll to results section
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(error => {
        console.error('Error calculating carbon footprint:', error);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        uploadStatus.textContent = 'Error processing your request. Please try again.';
        uploadStatus.style.display = 'block';
      });
    });
  }
  
  // Function to display results
  function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'block';
    
    // Update carbon score
    carbonScore.textContent = data.totalEmission.toFixed(2);
    
    // Update comparison text and color
    comparisonText.textContent = data.comparison.text;
    comparisonText.className = ''; // Reset classes
    comparisonText.classList.add(data.comparison.class); // Add appropriate class (better, average, worse)
    
    // Render chart
    renderChart(data.chartData);
    
    // Display recommendations
    displayRecommendations(data.recommendations);
    
    // Setup save and share buttons
    setupActionButtons(data);
  }
  
  // Function to render donut chart
  function renderChart(chartData) {
    // Destroy existing chart if it exists
    if (carbonChart) {
      carbonChart.destroy();
    }
    
    // Create new chart
    const ctx = chartCanvas.getContext('2d');
    carbonChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: [
            '#4CAF50', // Energy
            '#2196F3', // Transportation
            '#FFC107', // Waste
            '#03A9F4', // Water
            '#9C27B0'  // Other
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value.toFixed(2)} tons (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  // Function to display recommendations
  function displayRecommendations(recommendations) {
    // Clear existing recommendations
    recommendationsList.innerHTML = '';
    
    // Add each recommendation
    recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.textContent = rec;
      recommendationsList.appendChild(li);
    });
    
    // Show ML insights if available
    if (recommendations.mlInsights) {
      const insightHeader = document.createElement('h4');
      insightHeader.textContent = 'Smart Insights';
      recommendationsList.appendChild(insightHeader);
      
      recommendations.mlInsights.forEach(insight => {
        const li = document.createElement('li');
        li.className = 'ml-insight';
        li.textContent = insight;
        recommendationsList.appendChild(li);
      });
    }
  }
  
  // Function to setup action buttons
  function setupActionButtons(data) {
    // Save button - saves the carbon footprint to user's profile
    if (saveButton) {
      saveButton.onclick = function() {
        // Send a request to save the carbon footprint
        fetch('../../api/carbon/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            entryType: 'energy',
            value: parseFloat(data.entries.energy) || 0,
            unit: 'tons'
          })
        })
        .then(response => response.json())
        .then(result => {
          alert('Carbon footprint saved successfully!');
        })
        .catch(error => {
          console.error('Error saving carbon footprint:', error);
          alert('Failed to save carbon footprint. Please try again.');
        });
      };
    }
    
    // Share button - copies a shareable link to clipboard
    if (shareButton) {
      shareButton.onclick = function() {
        // Create a shareable URL with data in query params
        const shareData = {
          score: data.totalEmission.toFixed(2),
          comparison: data.comparison.text
        };
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(JSON.stringify(shareData))}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            alert('Link copied to clipboard! Share your carbon footprint with others.');
          })
          .catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link. Please try again.');
          });
      };
    }
  }
  
  // Check for shared data in URL
  function checkForSharedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
      try {
        const data = JSON.parse(decodeURIComponent(sharedData));
        
        // Display shared score
        resultsSection.style.display = 'block';
        carbonScore.textContent = data.score;
        comparisonText.textContent = data.comparison;
        
        // Add shared badge
        const sharedBadge = document.createElement('div');
        sharedBadge.className = 'shared-badge';
        sharedBadge.textContent = 'Shared Result';
        resultsSection.prepend(sharedBadge);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      } catch (e) {
        console.error('Error parsing shared data:', e);
      }
    }
  }
  
  // Initialize
  checkForSharedData();
});