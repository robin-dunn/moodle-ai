<?php
defined('MOODLE_INTERNAL') || die();

function local_assignmentbutton_before_footer() {
    global $PAGE;
    
    // Only load JavaScript on assignment view pages
    if ($PAGE->pagetype === 'mod-assign-view') {
        $PAGE->requires->js_call_amd(
            'local_assignmentbutton/inject_button',
            'init'
        );
    }
}