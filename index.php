<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>" />
<title><?php
	global $page, $paged;

	wp_title( '|', true, 'right' );

	bloginfo( 'name' );

	$site_description = get_bloginfo('description', 'display');
	if ( $site_description && ( is_home() || is_front_page() ) )
		echo " | $site_description";

	if ( $paged >= 2 || $page >= 2 )
		echo ' | ' . __('Page', 'bikeit') . max($paged, $page);

	?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo('stylesheet_url'); ?>" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
<link rel="shortcut icon" href="<?php echo get_template_directory_uri(); ?>/img/favicon.ico" type="image/x-icon" />
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="fragment" content="!" />
<?php wp_head(); ?>
</head>
<body <?php body_class(get_bloginfo('language')); ?> ng-controller="SiteController">

	<div id="messages" class="message-notification" ng-controller="MessageCtrl" ng-hide="isDialog">
		<div class="message-content" ng-repeat="message in messages" ng-show="message.text">
			<a class="close-button" ng-click="close(message)" href="javascript:void(0);">{{labels('Close')}}</a>
			<p ng-class="message.status" ng-bind-html="getMessage(message)"></p>
		</div>
	</div>

	<header id="masthead">

		<div class="container">
			<div class="two columns">
				<h1><a ui-sref="home"><?php bloginfo('name'); ?><img src="<?php echo get_template_directory_uri(); ?>/img/logo.png" /></a></h1>
			</div>
			<div class="ten columns alpha">
				<?php
				if(is_multisite()) {
					$sites = wp_get_sites();
					if(!empty($sites)) {
						$current = get_current_blog_id();
						$name = trim(str_replace('BikeIt', '', get_bloginfo('name')));
						$name = trim(str_replace('BikeIT', '', $name));
						echo '<div class="ms-dropdown-title">';
						echo '<h2 class="side-title">' . $name . '<span class="icon-triangle-down"></span></h2>';
						echo '<div class="ms-dropdown">';
							echo '<input type="text" placeholder="' . __('Search cities', 'bikeit') . '" ng-model="msSearch" />';
							$parsed_sites = array();
							foreach($sites as $site) {
								if($current != $site['blog_id']) {
									$details = get_blog_details($site['blog_id']);
									$name = trim(str_replace('BikeIt', '', $details->blogname));
									$name = trim(str_replace('BikeIT', '', $name));
									$parsed_sites[] = array(
										'url' => $details->siteurl,
										'name' => $name
									);
								}
							}
							echo "<ul ng-init='mSites = " . json_encode($parsed_sites) . "'>";
							echo '<li ng-repeat="site in mSites | filter:msSearch"><a href="{{site.url}}">{{site.name}}</a></li>';
							echo '</ul>';
						echo '</div>';
						echo '</div>';
					}
				}
				?>
				<nav id="main-nav">
					<?php
					if(is_multisite())
						switch_to_blog(1);
					wp_nav_menu( array( 'theme_location' => 'header-nav' ) );
					if(is_multisite())
						restore_current_blog();
					?>
				</nav>
				<div class="user" ng-controller="UserController" ng-show="loadedUser">
					<div class="user-nav" ng-show="user">
						<img ng-src="{{user.avatar}}" alt="{{user.name}}" />
						<p>
							<a ui-sref="user({userId: user.ID})">{{user.name}}</a>
							<a class="logout" href="{{logoutUrl}}">{{labels('Logout')}}</a>
						</p>
						<div class="user-nav-menu">
							<ul>
								<li><a ui-sref="user({userId: user.ID})">{{labels('My profile')}}</a></li>
								<li><a ui-sref="user.edit({userId: user.ID})">{{labels('Edit my profile')}}</a></li>
								<li ng-show="user.roles[0] == 'administrator' || user.roles[0] == 'editor' || user.superadmin"><a href="{{adminUrl}}" target="_self">{{labels('Control panel')}}</a></li>
								<li><a href="{{logoutUrl}}">{{labels('Logout')}}</a></li>
							</ul>
						</div>
					</div>
					<div ng-hide="user">
						<p><a class="button" href="javascript:void(0);" ng-click="loginForm()">{{labels('Login/Register')}}</a></p>
					</div>
				</div>
			</div>
		</div>

	</header>

	<div ui-view autoscroll="false">
		<p class="first-load"><?php _e('Loading', 'bikeit'); ?>...</p>
	</div>


	<footer id="colophon">

		<div class="container">
			<div class="twelve columns">
				<div class="colophon-content">
					<div class="four columns alpha">
						<?php	if(is_multisite()) switch_to_blog(1);	?>
						<?php wp_nav_menu( array( 'theme_location' => 'footer-nav' ) ); ?>
						<?php if(is_multisite()) restore_current_blog(); ?>
					</div>
					<div class="four columns">
						<div class="footer-logo"></div>
						<p class="site-desc"><?php _e('Collaborative mapping bike-friendly city spots', 'bikeit'); ?></p>
					</div>
					<div class="four columns omega">
						<ul class="colophon-widgets">
							<?php dynamic_sidebar('footer-sidebar'); ?>
						</ul>
						<p class="dev"><?php _e('Development by', 'bikeit'); ?> <a href="http://codigourbano.org" title="Código Urbano" rel="extenral" target="_blank"><img src="<?php echo get_template_directory_uri(); ?>/img/codigourbano.png" alt="Código Urbano" /></a></p>
					</div>
					<p class="source"><a class="icon icon-github" href="https://github.com/codigourbano/bikeit" title="<?php _e('Our source is open', 'bikeit'); ?>" rel="external" target="_blank"></a></p>
				</div>
			</div>
		</div>

	</footer>

	<div id="loading" loading-status-message ng-class="{active: loads.length}">
		<div class="loading-message"></div>
	</div>

	<?php wp_footer(); ?>

</body>
</html>
