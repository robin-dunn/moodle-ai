<?php
defined('MOODLE_INTERNAL') || die();

function local_showmyai_before_footer() {
    global $PAGE;

    // Only load JavaScript on assignment view pages
    if ($PAGE->pagetype === 'mod-assign-view') {
        $PAGE->requires->js_call_amd(
            'local_showmyai/inject_button',
            'init'
        );
    }
}