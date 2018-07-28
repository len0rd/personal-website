var $document = $(document),
    $nav = $('.navbar'),
    navbarDef = 'bg-dark',
    effect = 'fadeInDown';

console.log('waddup');
if (window.location.pathname ==='/') {
    $document.scroll(function() {
        //if >100 pixels have been scrolled
        if ($document.scrollTop() >= 100) {
            $nav.addClass(navbarDef);
            $nav.addClass(effect); //add animation effect
        } else {
            $nav.removeClass(navbarDef);
            $nav.removeClass(effect); //add animation effect
        }
    });
} else {
    $nav.addClass(navbarDef);
    $nav.addClass(effect); //add animation effect
}