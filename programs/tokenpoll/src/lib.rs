use anchor_lang::prelude::*;

declare_id!("6ooW7oEFrPzNayKVd4qYzVMKickuA8N1r6rFcy44J4Fj");

#[program]
pub mod poll_voting {
    use super::*;

    pub fn create_poll(ctx: Context<CreatePoll>, question: String, options: Vec<String>) -> Result<()> {
        require!(options.len() > 1 && options.len() <= 5, PollError::InvalidOptionCount);
        
        let poll = &mut ctx.accounts.poll;
        poll.authority = ctx.accounts.authority.key();
        poll.question = question;
        poll.options = options;
        poll.votes = vec![0; poll.options.len()];
        
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        require!(option_index < poll.options.len() as u8, PollError::InvalidOptionIndex);
        
        poll.votes[option_index as usize] += 1;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 4 + 256 + 4 + 256 * 5 + 4 + 8 * 5)]
    pub poll: Account<'info, Poll>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    pub voter: Signer<'info>,
}

#[account]
pub struct Poll {
    pub authority: Pubkey,
    pub question: String,
    pub options: Vec<String>,
    pub votes: Vec<u64>,
}

#[error_code]
pub enum PollError {
    #[msg("Poll must have between 2 and 5 options")]
    InvalidOptionCount,
    #[msg("Invalid option index")]
    InvalidOptionIndex,
}