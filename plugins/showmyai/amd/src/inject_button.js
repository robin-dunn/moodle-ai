define(['jquery'], function($) {
    return {
        init: function() {
            console.log('ShowMyAI plugin loaded');
            
            $(document).ready(function() {
                // Find the assignment intro section
                var targetElement = $('#intro');
                
                if (targetElement.length) {
                    // Create the button
                    var button = $('<button>')
                        .addClass('btn btn-primary')
                        .css('margin-top', '10px')
                        .text('Open ShowMyAI Custom Tool')
                        .on('click', function() {
                            var assignmentId = getAssignmentId();
                            // Later: window.open('https://your-saas.com?assignment=' + assignmentId, '_blank');
                            console.log('Button clicked! Assignment ID: ' + assignmentId);
                            window.open('https://www.google.com');
                        });
                    
                    // Insert button after intro
                    targetElement.after(button);
                    console.log('Button injected successfully');
                } else {
                    console.log('Target element #intro not found');
                }
            });
            
            // Helper function to extract assignment ID from URL
            function getAssignmentId() {
                var urlParams = new URLSearchParams(window.location.search);
                return urlParams.get('id') || 'unknown';
            }
        }
    };
});