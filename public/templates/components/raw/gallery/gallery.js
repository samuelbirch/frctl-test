const func = $target => {
	if ($target[0]) {
		window.loader.keys(['colcade'], function() {
			var $gallery = $target.find('.gallery');
			var $modal = $target.find('.modal');

			$gallery.colcade({
				columns: '.gallery-col',
				items: '.gallery-item'
			});

			// $(window).resize(function() {
			//     mod104Reveal.css('height', mod104Gallery.height());
			// });
			//custom color for modal
			$modal.on('show.bs.modal', function(e) {
				$('body').addClass('modal104-modal');
				var currImgSrc = $(e.relatedTarget).data('full-src');
				$(this)
					.find('img')
					.attr('src', currImgSrc);
			});
			$modal.on('hidden.bs.modal', function(e) {
				$('body').removeClass('modal104-modal');
				$(this)
					.find('img')
					.attr('src', '');
			});
			//update img src in modal
			// mod104Gallery.find('[data-target]').click(function() {
			//     var tempUrl = $(this).data('full-src');
			//     mod104Modal.find('img').attr('src', tempUrl);
			// });
		});
	}
};

export default func;
