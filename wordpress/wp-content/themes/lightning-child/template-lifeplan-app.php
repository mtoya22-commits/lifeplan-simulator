<?php
/**
 * Template Name: Life Plan Simulator App
 * Template Post Type: page
 * Description: WordPress統合版・生活設計シミュレーター専用ページテンプレート
 */
get_header();
do_action( 'lightning_before_main' );
?>
<main class="content-wrapper">
  <div class="lifeplan-app">
    <?php the_content(); ?>
  </div>
</main>
<?php
do_action( 'lightning_after_main' );
get_footer();
?>
