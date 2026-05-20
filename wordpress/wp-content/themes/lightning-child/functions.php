<?php
function enqueue_lifeplan_app() {
  if ( is_page( 6 ) ) {
    $js_path  = ABSPATH . 'lifeplan-simulator/script.js';
    $css_path = ABSPATH . 'lifeplan-simulator/style.css';
    $js_ver   = file_exists( $js_path )  ? filemtime( $js_path )  : null;
    $css_ver  = file_exists( $css_path ) ? filemtime( $css_path ) : null;

    wp_enqueue_style( 'lifeplan-app', site_url( '/lifeplan-simulator/style.css' ), array(), $css_ver );
    wp_enqueue_script(
      'chartjs',
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js',
      array(), '4.4.8', true
    );
    wp_enqueue_script(
      'lifeplan-app',
      site_url( '/lifeplan-simulator/script.js' ),
      array( 'chartjs' ), $js_ver, true
    );
  }
}
add_action( 'wp_enqueue_scripts', 'enqueue_lifeplan_app' );
