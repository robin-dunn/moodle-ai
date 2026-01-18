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
                        .text('Open ShowMyAI Tool')
                        .on('click', function() {
                            var assignmentId = getAssignmentId();
                            console.log('Button clicked! Assignment ID: ' + assignmentId);
                            window.open('http://localhost:3000/assignment?id=' + assignmentId);
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