# Add a new protocol

To add a new protocol to be tracked by Stackspulse, follow the following steps:

1. Fork the repository.
2. Edit the `packages/protocols/src/protocols.ts` file and add the new protocol to the `protocols` array and its information to the `protocolsInfo` object.
3. Create a new pull request with the changes.

## Custom transactions list

If you want to add a custom transactions messages and give more context to the transactions, you can add a new file following the `apps/web/src/components/Transaction/Action/StackingDAO.tsx` approach.

That way instead of seeing the message `Call withdraw`, you can do some custom logic and show the message you want. For example, in the StackingDAO protocol, we show the `Withdraw 307.86 STX` message by parsing the transaction events returned by the stacks API.
