<?php
function enqueue_lifeplan_app() {
  if ( is_page( 6 ) ) {
    wp_enqueue_style( 'lifeplan-app', site_url( '/lifeplan-simulator/style.css' ) );
    wp_enqueue_script(
      'chartjs',
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js',
      array(), '4.4.8', true
    );
  }
}
add_action( 'wp_enqueue_scripts', 'enqueue_lifeplan_app' );
