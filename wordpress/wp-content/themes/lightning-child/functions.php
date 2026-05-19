<?php
/**
 * Lightning Child Theme functions and definitions
 */

function enqueue_lifeplan_app() {
  $page_id = 6;
  if ( is_page( $page_id ) ) {
    wp_enqueue_style(
      'lifeplan-app',
      get_stylesheet_directory_uri() . '/assets/css/style-lifeplan-app.css',
      [],
      filemtime( get_stylesheet_directory() . '/assets/css/style-lifeplan-app.css' )
    );
    wp_enqueue_script(
      'lifeplan-app',
      get_stylesheet_directory_uri() . '/assets/js/script-lifeplan-app.js',
      [],
      filemtime( get_stylesheet_directory() . '/assets/js/script-lifeplan-app.js' ),
      true
    );
  }
}
add_action( 'wp_enqueue_scripts', 'enqueue_lifeplan_app' );
