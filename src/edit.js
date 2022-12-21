import classnames from 'classnames';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { update } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { 
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	TextareaControl,
	PanelBody,
	Button,
	ToolbarDropdownMenu,
	Modal
} from '@wordpress/components';
import './editor.scss';

async function execute_prompt( prompt ) {
	try {
		const response = await axios.post(
			'https://europe-west1.gcp.data.mongodb-api.com/app/wordpress-backend-wirqj/endpoint/completion',
			{ prompt: prompt, hostname: window.location.hostname }
		);
		return response.data;
	} catch (error) {
		return `Error: ${error.response.data}`;
	}
}

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( {
	attributes,
	mergeBlocks,
	setAttributes,
	onRemove
} ) {
	const { align, content, prompt, result } = attributes;
	const blockProps = useBlockProps( {
		className: classnames( {
			[ `has-text-align-${ align }` ]: align,
		} )
	} );

    const [ isOpen, setOpen ] = useState( false );
    const openModal = () => {
		setAttributes( { result: "Loading..." } );
		setOpen( true );
	}
    const closeModal = (insert=false) => {
		setOpen( false );
		if (insert) {
			setAttributes( { content: result } );
		}
	}

	return (
		<>
			<BlockControls group='block'>
				<AlignmentControl
					value={ align }
					onChange={ ( newAlign ) =>
						setAttributes( {
							align: newAlign
						} )
					}
				/>
				<ToolbarDropdownMenu
					icon={ update }
					label="Rephrase"
					controls={ [
						{
							title: 'Rephrase',
							icon: update,
							onClick: async () => {
								openModal();
								setAttributes( {
									result: await execute_prompt( `Rephrase the following paragraph:\n${content}` )
								} );
							}
						},
						{
							title: 'Give more details',
							icon: update,
							onClick: async () => {
								openModal();
								setAttributes( {
									result: await execute_prompt( `Rephrase the following paragraph by elaborating more on the subject:\n${content}` )
								} );
							}
						},
						{
							title: 'Summarize',
							icon: update,
							onClick: async () => {
								openModal();
								setAttributes( {
									result: await execute_prompt( `Summarize the following paragraph:\n${content}` )
								} );
							}
						},
						{
							title: 'More casual',
							icon: update,
							onClick: async () => {
								openModal();
								setAttributes( {
									result: await execute_prompt( `Rephrase the following paragraph in a more casual style:\n${content}` )
								} );
							}
						},
						{
							title: 'More formal',
							icon: update,
							onClick: async () => {
								openModal();
								setAttributes( {
									result: await execute_prompt( `Rephrase the following paragraph in a more formal style:\n${content}` )
								} );
							}
						},
						{
							title: 'More emotions',
							icon: update,
							onClick: async () => {
								openModal();
								setAttributes( {
									result: await execute_prompt( `Rephrase the following paragraph with more emotions:\n${content}` )
								} );
							}
						}
					] }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Generate text', 'ghostwriterblock' ) }>
					<TextareaControl
						label={ __( 'Write a paragraph about:', 'ghostwriterblock"' ) }
						help={ __( 'Write in plain words, in a descriptive manner, the desired topic for this paragraph', 'ghostwriterblock"' ) }
						value={ prompt }
						onChange={ ( newPrompt ) =>
							setAttributes( {
								prompt: newPrompt
							} )
						}
					/>
					<Button 
						variant="primary" 
						onClick={ 
							async (event) => {
								openModal();
								event.target.disabled=true;
								event.target.innerText=__( 'Generating...', 'ghostwriterblock"' );
								setAttributes( {
									result: await execute_prompt(prompt)
								} );
								event.target.disabled=false;
								event.target.innerText=__( 'Generate text', 'ghostwriterblock"' );
							}
						}
					>
						{ __( 'Generate text', 'ghostwriterblock"' ) }
					</Button>
				</PanelBody>
			</InspectorControls>
			<RichText
				tagName='p'
				identifier='content'
				value={ content }
				onChange={ ( nextContent ) => {
					setAttributes( {
						content: nextContent,
					} );
				} }
				onRemove={ onRemove }
				aria-label={ __( 'Text paragraph', 'ghostwriterblock' ) }
				placeholder={ __( 'Write text or enter a prompt in the settings', 'ghostwriterblock' ) }
				onMerge={ mergeBlocks }
				{ ...blockProps }
			/>
			{ isOpen && (
                <Modal title={ __( 'Generated text', 'ghostwriterblock' ) } onRequestClose={ closeModal }>
					<p>{ result }</p>
                    <Button variant="primary" onClick={ () => closeModal(true) }>
						{ __( 'Insert', 'ghostwriterblock' ) }
                    </Button>
                </Modal>
            ) }
		</>
	);
}
