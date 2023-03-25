$(document).ready(function(){

	$('.addwatch').click(function(e){
		e.preventDefault();
		elem = $(this);
		order_id = elem.attr('id').split('-')[1];
		$.ajax({
			url : '/sys/orders.bookmark/' + order_id,
			success : function()
			{
				elem.toggleClass('eye_open');
				elem.toggleClass('eye_close');
                if(elem.hasClass('eye_open'))
                {
                    elem.attr('title','Remove order from \'My Watch List\'');
                }
                else
                {
                    elem.attr('title','Add order to \'My Watch List\' section for further follow up.');
                }
                
			}
		})
	})

	$('.order-hide').click(function(e){
		e.preventDefault();
		elem = $(this);
		order_id = elem.attr('id').split('-')[2];
		$.ajax({
			url : '/sys/orders.visibility/' + order_id,
			success : function($result)
			{
                if ($result == 'hide')
                {
                    $('#order-'+order_id).hide();
                    $('#order-info-'+order_id).hide();
                }
                else
                {
                    $('#order-info-' + order_id + ' .order-hide')
                                        .html('Hide order')
                                        .parent()
                                        .removeClass('disable');
                }
			}
		})
	})

	if (typeof(p1) != 'undefined')
	{
		p1.element = $('#paginator');
		p1.init();

		p2 = p1;
		p2.element = $('#paginator2');
		p2.init();
	}
})

var Paginator = {
	pages_total : 0,
	pages_span : 5,
	page_current : 1,
	link : '',
	element : null,
	init : function()
	{
		$(this.element).paginator({pagesTotal: this.pages_total,
			pagesSpan: this.pages_span,
			pageCurrent: this.page_current,
			baseUrl: this.link + '?p=%number%',
			lang: {
			next  : "Next",
			last  : "Last",
			prior : "Prior",
			first : "First",
			arrowRight : String.fromCharCode(8594),
			arrowLeft  : String.fromCharCode(8592)
		}});
	}
}
