<?php
function enqueue_lifeplan_app() {
  if ( is_page( 6 ) ) {
    wp_enqueue_style(
      'lifeplan-app',
      site_url( '/lifeplan-simulator/style.css' )
    );
    wp_enqueue_script(
      'lifeplan-app',
      site_url( '/lifeplan-simulator/script.js' ),
      array(),
      false,
      true
    );
  }
}
add_action( 'wp_enqueue_scripts', 'enqueue_lifeplan_app' );
