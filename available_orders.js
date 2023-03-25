var Filters =
{
	TIME_REMAINING: '',
	NUMBER_OF_PAGES: '',
    NUMBER_OF_WORDS: '',
	ORDER_TOTAL_FILTER: '',
	RESUME_WRITER: '',
    is_translation: false,

	/**
	 * Initialize filters
	 * @param {Object} opts Filters customization
	 */
    init: function(opts)
	{
        var ctrlDown = false;
        var ctrlKey = 17, vKey = 86, cKey = 67, aKey = 65;

		if (opts)
		{
			$.extend(Filters, opts);
		}

		// order labels and show hiden order processing
		$('div.links a,div.hiddenOrders a').click(function()
	    {
			var input = $(this).parents('label').find('input');
			input.attr('checked', ! input.is(':checked')).change();
			return false;
		});

		$('div.links input,div.hiddenOrders input').change(function()
		{
			if (this.checked)
			{
				Filters.addSelected(this.id, $(this).siblings('a').attr('title'));
			}
			else
			{
				Filters.removeSelected(this.id);
			}
		});
        
		$('a.labelName').click(function()
		{
            var input = $(this).parent().find('input');

			if (!input.is(':checked'))
			{
                input.attr('checked', 'checked');
				Filters.addSelected(input.attr('id'), input.siblings('a').attr('title'));
			}
			else
			{
                input.attr('checked', '');
				Filters.removeSelected(input.attr('id'));
			}
		});

		// reset filter buttons processing
		$('input[type=button].resetFilter').click(function()
		{
			if (this.id == Filters.TIME_REMAINING)
			{
				$('#'+this.id+'_days, #'+this.id+'_hours').val('');
			}
			else
			{
				$('#'+this.id+'_from, #'+this.id+'_to').val('');
			}

			Filters.doSubmit();
		});

		// reset all filters button processing
		$('input[type=button].resetFiltersAll').click(function()
		{
			$('form[name=filters] :input:not(#orderby,#orderbytype)').removeAttr('name');//.attr('disabled', true);
			Filters.doSubmit();
		});
        
		$('.filters a').live('click', function()
		{
			Filters.removeChecked(this.id);

			return false;
		});

		$('div.item a').click(function ()
		{
			var input = $(this).parents('div.item').find('input');

			input.attr('checked', !input.is(':checked'));

			Filters.setItemChecked(input);

			return false;
		});

		$('div.item input[type="checkbox"]').click(function ()
		{
			Filters.setItemChecked($(this));
		});

		$('.open_close').click(function ()
		{
			Filters.showHideSubjects($(this).attr('id'));

			return false;
		});

		$('#pagesnum_from, #pagesnum_to, #wordsnum_from, #wordsnum_to, #ordertotal_from, #ordertotal_to, #timeremaining_days, #timeremaining_hours').live('keydown paste',function(e)
		{
            if (e.ctrlKey) ctrlDown = true;
			// permit only numbers, backspace, delete and arrows
			return (! e.shiftKey && ! e.altKey)
					&& (e.which >= 48 && e.which <= 57 || e.which >= 37 && e.which <= 40 || e.which == 8 || e.which == 46
                        || ((e.keyCode == vKey || e.keyCode == cKey || e.keyCode == aKey) && ctrlDown)
                        || e.which >= 96 && e.which <= 105);
		}).keyup(function(e)
        {
            ctrlDown = false;
        });

		this.triggerSelected();

		// setup submit event
		$(document.forms.filters).submit(this.onSubmit);
    },

    showHideSubjects : function(name)
    {
        $('#short' + name + ',#long' + name).toggle();

        if ($('#short' + name).is(':visible'))
        {
            $('#long' + name + ' input:checked').each(function ()
            {
                Filters.removeChecked(this.id);
            });
        }
        else
        {
            // flush 'Selected filters' block
            $('.selectedBlock .filters').empty();

            $('#short' + name + ' input').each(function ()
            {
                Filters.setItemChecked($('#long' + name + ' input[id=' + this.id + ']').attr('checked', true));
            });

            if (name == '')
            {
                $('#order_type input:checked').each(function ()
                {
                    Filters.setItemChecked($(this));
                });

                $('div.links input:checked, div.hiddenOrders input:checked, div.item input:checked').each(function()
                {
                    Filters.addSelected(this.id, $(this).siblings('a').attr('title'));
                });
            }
        }
    },
    /**
     * Pre-submit method to filters form
     * @return bool If false than form submit will be canceled
     */
	onSubmit: function()
	{
		Filters.prepareRange(Filters.NUMBER_OF_PAGES);

        if (Filters.is_translation)
        {
            Filters.prepareRange(Filters.NUMBER_OF_WORDS);
        }

		Filters.prepareRange(Filters.ORDER_TOTAL_FILTER);
		Filters.prepareTimeRemaining();

		return true;
	},

    /**
     * Submit filters form to the server
     */
	doSubmit: function()
	{
		$(document.forms.filters).submit();
	},

    /**
     * This method used to join values from child fields 'from' and 'to' using delimiter ';'
     * @param name Range field name
     */
	prepareRange: function(name)
	{
		if ( ! isNaN(parseInt($('#'+name+'_from').val()) + parseInt($('#'+name+'_to').val())))
		{
			$('#'+name)
				.val(parseInt($('#'+name+'_from').val())+';'+parseInt($('#'+name+'_to').val()))
				.attr('disabled', false);
		}
		else
		{
			$('#'+name).attr('disabled', true);
		}
	},

	/**
	 * This method used to prepare values for a time remaining filter
	 */
	prepareTimeRemaining: function()
	{
		var name_orig = Filters.TIME_REMAINING,
			name = $('input[name='+name_orig+'_maxmin]:checked').val(),
			days = parseInt($('#'+name_orig+'_days').val()),
			hours = parseInt($('#'+name_orig+'_hours').val());

		$('input[name='+name_orig+'_maxmin]').removeAttr('name');

		hours = isNaN(hours) || hours < 1 ? 0 : (hours > 23 ? 23 : hours);
		days = isNaN(days) || days < 1 ? 0 : days;

		if (hours + days * 24 == 0)
		{
			$('input[name='+name_orig+']')
					.attr('disabled', true);
		}
		else
		{
			$('input[name='+name_orig+']')
					.attr('name', 'filter['+name+'][]')
					.val(hours + days * 24);
		}
	},

	/**
     * Kos, write method desc here
     * @param {jQuery} input jQuery object
     */
    setItemChecked: function(input){
        var name = input.attr('id'),
			blockCheckbox;

	    blockCheckbox = (input.parents('.blockCheckbox').is('#short') ? $('#long') : $('#short'));

		blockCheckbox
			.children()
			.find('#'+name+'"')
			.attr('checked', input.is(':checked'));

        if (input.is(':checked'))
        {
            Filters.addSelected(input.attr('id'), input.next('a').attr('title'));
            Filters.showHideTranslationBlock(name, true);
        }
        else
        {
            Filters.removeSelected(name);
            Filters.showHideTranslationBlock(name, false);
        }
    },

    showHideTranslationBlock: function(name, show)
    {
        if (name == 'doctype_253')
        {
            if (show)
            {
                $('.translation_block').show();
            }
            else
            {
                $('#long_translation input:checked, #short_translation input:checked').each(function ()
                {
                    Filters.removeChecked(this.id);
                });

                $('.translation_block').hide();
                $('#wordsnum_from, #wordsnum_to').val('');
            }

        }
    },

	/**
	 * Append filter to Selected filters block
	 * @param {String} id
	 * @param {String} title
	 */
    addSelected: function(id, title)
	{
		title = $.trim(title).replace(' ', '&nbsp;')+' ';
        if (!$('.filters #' + id).length)
        {
            $('.selectedBlock .filters').append('<a href="#" id="'+id+'">'+title+'</a>');
        }
        $('.selectedBlock').show();
        if (id == Filters.RESUME_WRITER)
        {
            $('#resume_level').show();
        }
    },

    /**
     * Kos, write method desc here
     * @param {String} id
     */
    removeSelected: function(id)
    {
        $('.selectedBlock .filters a[id="'+id+'"]').remove();

        if ($('.selectedBlock .filters a').length == 0)
        {
            $('.selectedBlock').hide();
        }
        if (id == Filters.RESUME_WRITER)
        {
            $('#resume_level').hide();
        }
    },

	/**
	 * Kos, write method desc here
     * @param {String} id
	 */
    removeChecked: function(id)
	{
        Filters.removeSelected(id);

		$('div.item,div.links,div.hiddenOrders')
				.find('input[id="'+id+'"]:first')
				.removeAttr('checked');
    },

	/**
	 * This method is used mainly at page initializing to add checked Order types
	 * and checked Subjects into Selected filters block
	 */
    triggerSelected: function()
	{
		var inputs = $('div.item input[type="checkbox"]:checked');

        if (inputs.size() > 0)
        {
            $('.selectedBlock').show();

            inputs.each(function()
            {
	            Filters.addSelected(this.id, $(this).next('a').attr('title'));
            });
        }
        else
        {
            $('.selectedBlock').hide();
        }
    }
};

$(document).ready(function()
{
	$('.restore_default button').click(function()
	{
		$('form #orderby, form #orderbytype')
				.attr('disabled', true)
				.parent()
				.submit();
	});

	$('.sortLine a').click(function()
	{
		$('form #orderbytype')
				.val($(this).is('.asc') ? 'desc' : 'asc')
				.attr('disabled', false);

		$('form #orderby')
				.val(this.id)
				.attr('disabled', false)
				.parent()
				.submit();

		return false;
	});

	$('#toggle_all_blocks').click(function()
	{
		var me = $(this);

		if (me.html() == 'Expand all')
		{
			me.html('Collapse all');
            showBlocks();
		}
		else
		{
			me.html('Expand all');
            hideBlocks();
		}
	});

    function showBlocks() {
        if ($.browser.msie) {
            $('#loading-mask').show();
        }
        setTimeout(function() {
            $('.AvailableBlock .availibleOrders').show();
            setTimeout(function(){$('#loading-mask').hide()}, 1000);
        }, 500);
    }

    function hideBlocks() {
        if ($.browser.msie) {
            $('#loading-mask').show();
        }
        setTimeout(function() {
            $('.AvailableBlock .availibleOrders').hide();
            setTimeout(function(){$('#loading-mask').hide()}, 1000);
        }, 500);
    }
});
