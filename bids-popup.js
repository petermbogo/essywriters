$(document).ready(function(){
	BidPopup.init();
})
var BidPopup =
{
	debug : true,
	init_time : 0,
	dst_delta : null,
	value : 0,
	server_init_time : '',
	min_deadline : '',
	max_deadline : '',
	deadline : '',
	order_id : 0,
	ajax_action : '',
	ajax_data : {},
	popup_call_event : null,
	init : function(){
		$('.bids_button').live('click', function(e){
			BidPopup.popup_call_event = e;
			e.preventDefault();
			BidPopup.closePopup();
			BidPopup.setOrder($(this).attr('id').split('_')[2])
			BidPopup.closePopup();
			$(this).addClass('bid_activated');
			BidPopup.showPopup($(this));
            $('#overlay').show();
		})
		$('.close-bids-popup').live('click', function(e){
			e.preventDefault();
			BidPopup.closePopup();
            $('#overlay').hide();
		})
		$('a[id^="place_bid_"]').live('click', function(e){
			e.preventDefault();
			BidPopup.setOrder($(this).attr('id').split('_')[2])
			BidPopup.editBid();
		})
		$('a[id^="save_bid_"]').live('click', function(e){
			e.preventDefault();
			BidPopup.setOrder($(this).attr('id').split('_')[2])
			BidPopup.saveBid();
		})
		$('a[id^="delete_bid_"]').live('click', function(e){
			e.preventDefault();
			BidPopup.setOrder($(this).attr('id').split('_')[2])
			BidPopup.deleteBid();
		})
		$('.bid_changer').live('click', function(e){
			e.preventDefault();
			switch($(this).attr('id'))
			{
				case 'bid_value_plus':
					$('#bid_value').text((parseFloat($('#bid_value').text()) + 0.1).toFixed(2));
					break;
				case 'bid_value_minus':
					new_value = (parseFloat($('#bid_value').text()) - 0.1).toFixed(2);
					if (new_value > 0)
					{
						$('#bid_value').text(new_value);
					}
					break;
			}
		})
		$('.bid_deadline_changer').live('click', function(){
			new_days = parseInt($('#bid_deadline_day').text(), 10);
			new_hour = parseInt($('#bid_deadline_hour').text(), 10);
			new_minute = parseInt($('#bid_deadline_minute').text(), 10);
			switch($(this).attr('id'))
			{
				case 'bid_dl_day_plus':
					new_days = parseInt($('#bid_deadline_day').text(), 10) + 1;
					break;
				case 'bid_dl_day_minus':
					new_days = parseInt($('#bid_deadline_day').text(), 10) - 1;
					break;
				case 'bid_dl_hours_plus':
					new_hour = parseInt($('#bid_deadline_hour').text(), 10) + 1;
					new_hour = new_hour >= 23 ? 23 : new_hour ;
					break;
				case 'bid_dl_hours_minus':
					new_hour = parseInt($('#bid_deadline_hour').text(), 10) - 1;
					new_hour = new_hour <= 0 ? 0 : new_hour ;
					break;
				case 'bid_dl_min_plus':
					new_minute = parseInt($('#bid_deadline_minute').text(), 10) + 1;
					new_minute = new_minute >= 59 ? 59 : new_minute ;
					break;
				case 'bid_dl_min_minus':
					new_minute = parseInt($('#bid_deadline_minute').text(), 10) - 1;
					new_minute = new_minute <= 0 ? 0 : new_minute ;
					break;
			}
			var new_deadline = BidPopup.getNewDeadline(new_days, new_hour, new_minute);
			BidPopup.setDeadline(new_deadline);
		})
	},
	initPopupMove : function(){
		$('.pop_title').mousedown(function(e){
			$(document).bind('movepopup', function(e) {
				$(document).css('cursor', 'move');
				$('#bids-popup-' + BidPopup.order_id).css('left', e.pageX - 395);
				$('#bids-popup-' + BidPopup.order_id).css('top', e.pageY - 240);
			});
			$(document).mousemove(function(e){$(document).trigger({
					type: 'movepopup',
					pageX: e.pageX,
					pageY: e.pageY
			})});
		})
		$(document).mouseup(function(){
			$(document).unbind('movepopup');
			$(document).css('cursor', 'default');
		})
	},
	onLoad : function()
	{
		$('#bid_deadline_day').text(this.fixZero(parseInt($('#bid_deadline_day').text(), 10)));
		$('#bid_deadline_hour').text(this.fixZero(parseInt($('#bid_deadline_hour').text(), 10)));
		$('#bid_deadline_minute').text(this.fixZero(parseInt($('#bid_deadline_minute').text(), 10)));
		
		if ($('#bid_value').length) {
			this.value = parseFloat($('#bid_value').val()).toFixed(2);
		}
		this.init_time = new Date();
		this.init_time.setSeconds(0, 0);

		this.setDeadline(this.min_deadline);

		$('a.bid_activated').removeClass('bid_activated');

		this.initPopupMove();
		window.setTimeout(this.closePopup, 5*60*1000);
	},
	setOrder : function(order_id){
		this.order_id = order_id;
	},
	showPopup : function()
	{
		this.ajax_action = "/sys/orders/bids.info/" + this.order_id;
		this.ajax();
	},
	closePopup : function(){
		$('#bids-popup-' + BidPopup.order_id).remove();
	},
	editBid : function(){
		$('.bid_toggle').slideToggle('slow,');
		$('.pop_buttons').hide();
		$('.pop_buttons_cancell').css('display', '');
	},
	deleteBid : function(){
		this.ajax_action = '/sys/orders/bids.delete/' + this.order_id;
		this.ajax();
	},
	saveBid : function(){
		this.ajax_action = '/sys/orders/bids.save/' + this.order_id;
		this.ajax_data = {value : $('#bid_value').text(), deadline : (parseInt(this.server_init_time, 10) + this.getDeadlineOffsetInSeconds(this.getDeadline()))};
		this.ajax();
	},
	ajax : function(do_reload){
		$.ajax({
			url: this.ajax_action,
			type: "post",
			data : this.ajax_data,
			dataType: 'json',
			success: function(response){
				if (do_reload != true)
				{
					$('#bids-popup-container-' + BidPopup.order_id).replaceWith(response.popup);
					$('#bid-button-' + BidPopup.order_id).replaceWith(response.button);
					if (typeof(BidPopup.popup_call_event) != null)
					{
						$('#bids-popup-' + BidPopup.order_id).css('top', BidPopup.popup_call_event.pageY - 400);
					}
					BidPopup.onLoad();
				}
				else
				{
					$(document).trigger('submitFilters');
				}
			}
		})
	},
	fixZero : function(num){
		return (num < 10 && num > 0 ? '0'+num : (num < 0 ? 0 : num)) ;
	},
	setDeadline : function(deadline){
		if (this.isCorrectDeadline(deadline))
		{
			this.deadline = new Date(deadline.getTime());
		}
		else if (deadline.getTime() >= BidPopup.max_deadline.getTime())
		{
			this.deadline = new Date(this.max_deadline.getTime());
		}
		else if (deadline.getTime() <= BidPopup.min_deadline.getTime())
		{
			this.deadline = new Date(this.min_deadline.getTime());
		}

		this.setDeadlineText(this.getDeadline());
		this.updateDeadlineInputs();
	},
	getDeadline : function(){
		return this.deadline;
	},
	getDeadlineDateTime : function(deadline)
	{
		month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		time = new Date(deadline.getTime() - this.getDSTDelta() * 3600 * 1000);

		return time.getFullYear()+'-'+month[time.getMonth()]+'-'+this.fixZero(time.getDate())+' '+this.fixZero(time.getHours()) + ':' + this.fixZero(time.getMinutes())+':00';
	},
	getDeadlineOffsetInSeconds : function(deadline){
		return parseInt($('#bid_deadline_day').text(), 10) * 24 * 3600 + 
				parseInt($('#bid_deadline_hour').text(), 10) * 3600 + 
				parseInt($('#bid_deadline_minute').text(), 10) * 60 + 60;
	},
	setDeadlineText : function(deadline){
		month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		time = new Date(deadline.getTime() - this.getDSTDelta() * 3600 * 1000);
		deadline_datetime ='Bid deadline (<strong>' + this.fixZero(time.getHours()) + ':' +
											this.fixZero(time.getMinutes()) + '</strong> ' +
											this.fixZero(time.getDate()) + ' '+
											month[time.getMonth()] + ' ' +
											time.getFullYear() + '):';
										
		$('#bid_deadline').html(deadline_datetime);
	},
	isCorrectDeadline : function(deadline){
		return ( (deadline instanceof Date) && (deadline.getTime() <= this.max_deadline.getTime()) && (deadline.getTime() >= BidPopup.min_deadline.getTime()));
	},
	getDSTDelta : function(){
		if (this.dst_delta == null)
		{
			dst_delta = 0;
			php_min = this.min_deadline;
			js_min = new Date(this.init_time.getTime() + parseInt($('#bid_deadline_day').text(), 10)*24*3600000 + parseInt($('#bid_deadline_hour').text(), 10)*3600000 + (parseInt($('#bid_deadline_minute').text(), 10)+1)*60000);

			if((Math.abs(php_min.getTime() - js_min.getTime()) >= 3600000))
			{
				dst_delta = (php_min.getTime() - js_min.getTime() >= 3600000) ? 1 : -1 ;
			}
			
			this.dst_delta = dst_delta;
		}

		return this.dst_delta;
	},
	getNewDeadline : function(add_days, add_hours, add_minutes){
		var new_deadline = new Date();
		new_deadline.setTime(this.init_time.getTime() + 
			parseInt(add_days, 10)*24*60*60*1000 + 
			(parseInt(add_hours, 10) + this.getDSTDelta())*60*60*1000 + 
			(parseInt(add_minutes, 10)+1)*60*1000);
		new_deadline.setSeconds(0, 0);
		
		return new_deadline;
	},
	isCorrectValue : function(){
		return (parseFloat(this.value).toFixed(2) > 0);
	},
	updateDeadlineInputs : function(){
		time = this.getDeadline().getTime() - this.init_time.getTime() - 1 * 60 * 1000 - this.getDSTDelta() * 60 * 60 * 1000;
		days = parseInt(time / (24 * 3600 * 1000), 10);
		
		time = time % (24 * 3600 * 1000);
		hours = parseInt(time / (3600 * 1000), 10);

		time = time % (3600 * 1000);
		minutes = parseInt(time / (60 * 1000), 10);

		$('#bid_deadline_day').text(BidPopup.fixZero(days));
		$('#bid_deadline_hour').text(BidPopup.fixZero(hours));
		$('#bid_deadline_minute').text(BidPopup.fixZero(minutes));
	}
}
