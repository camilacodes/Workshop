// AWS Cost Calculator - Preços baseados em us-east-1
const AWS_PRICING = {
    s3: {
        storage: 0.023, // por GB/mês
        requests: 0.0004 // por 1000 requests
    },
    rds: {
        storage: 0.115 // por GB/mês
    },
    lambda: {
        requests: 0.0000002, // por request
        duration: 0.0000166667 // por GB-segundo
    }
};

function calculateCosts() {
    // EC2 Costs
    const ec2Instances = parseInt(document.getElementById('ec2-instances').value) || 0;
    const ec2HourlyRate = parseFloat(document.getElementById('ec2-type').value);
    const ec2Hours = parseInt(document.getElementById('ec2-hours').value) || 0;
    const ec2Cost = ec2Instances * ec2HourlyRate * ec2Hours;

    // S3 Costs
    const s3Storage = parseInt(document.getElementById('s3-storage').value) || 0;
    const s3Requests = parseInt(document.getElementById('s3-requests').value) || 0;
    const s3Cost = (s3Storage * AWS_PRICING.s3.storage) + (s3Requests * AWS_PRICING.s3.requests);

    // RDS Costs
    const rdsInstances = parseInt(document.getElementById('rds-instances').value) || 0;
    const rdsHourlyRate = parseFloat(document.getElementById('rds-type').value);
    const rdsStorage = parseInt(document.getElementById('rds-storage').value) || 0;
    const rdsComputeCost = rdsInstances * rdsHourlyRate * 744; // 744 horas por mês
    const rdsStorageCost = rdsStorage * AWS_PRICING.rds.storage;
    const rdsCost = rdsComputeCost + rdsStorageCost;

    // Lambda Costs
    const lambdaRequests = parseFloat(document.getElementById('lambda-requests').value) || 0;
    const lambdaDuration = parseInt(document.getElementById('lambda-duration').value) || 0;
    const lambdaMemory = parseInt(document.getElementById('lambda-memory').value) || 128;
    
    const lambdaRequestsCost = (lambdaRequests * 1000000) * AWS_PRICING.lambda.requests;
    const lambdaGBSeconds = (lambdaRequests * 1000000) * (lambdaDuration / 1000) * (lambdaMemory / 1024);
    const lambdaDurationCost = lambdaGBSeconds * AWS_PRICING.lambda.duration;
    const lambdaCost = lambdaRequestsCost + lambdaDurationCost;

    // Total Cost
    const totalCost = ec2Cost + s3Cost + rdsCost + lambdaCost;

    // Update UI
    document.getElementById('ec2-cost').textContent = `$${ec2Cost.toFixed(2)}`;
    document.getElementById('s3-cost').textContent = `$${s3Cost.toFixed(2)}`;
    document.getElementById('rds-cost').textContent = `$${rdsCost.toFixed(2)}`;
    document.getElementById('lambda-cost').textContent = `$${lambdaCost.toFixed(2)}`;
    document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)}`;

    // Show results
    document.getElementById('results').style.display = 'block';
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    // Add animation
    const resultSection = document.getElementById('results');
    resultSection.style.opacity = '0';
    resultSection.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        resultSection.style.transition = 'all 0.5s ease';
        resultSection.style.opacity = '1';
        resultSection.style.transform = 'translateY(0)';
    }, 100);
}

// Add input validation and real-time updates
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Validate numeric inputs
            if (this.type === 'number') {
                const value = parseFloat(this.value);
                if (value < 0) {
                    this.value = 0;
                }
                
                // Special validation for EC2 hours (max 744 hours per month)
                if (this.id === 'ec2-hours' && value > 744) {
                    this.value = 744;
                }
            }
        });
    });

    // Add keyboard shortcut for calculation (Ctrl+Enter)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            calculateCosts();
        }
    });
});

// Export function for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateCosts, AWS_PRICING };
}