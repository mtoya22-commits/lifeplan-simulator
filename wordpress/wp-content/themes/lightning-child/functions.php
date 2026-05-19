<?php
/**
 * Lightning Child Theme functions and definitions
 */

function enqueue_lifeplan_app() {
  $page_id = 6;
  if ( is_page( $page_id ) ) {
    $simulator_dir = dirname( dirname( dirname( dirname( dirname( dirname( __DIR__ ) ) ) ) ) . '/lifeplan-simulator';
    $simulator_uri = site_url( '/lifeplan-simulator' );

    wp_enqueue_style(
      'lifeplan-app',
      $simulator_uri . '/style.css',
      [],
      filemtime( $simulator_dir . '/style.css' )
    );
    wp_enqueue_script(
      'lifeplan-app',
      $simulator_uri . '/script.js',
      [],
      filemtime( $simulator_dir . '/script.js' ),
      true
    );
  }
}
add_action( 'wp_enqueue_scripts', 'enqueue_lifeplan_app' );
