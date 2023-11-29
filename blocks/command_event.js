module.exports = {
    name: "Command [Event]",

    description: "When an user types this bot command, this event will trigger.",

    category: "Events",

    auto_execute: true,

    inputs: [
        {
            "id": "command_name",
            "name": "Command Name",
            "description": "Acceptable Types: Text, Unspecified\n\nDescription: The name the user needs to type to execute and to identify this command.",
            "types": ["text", "unspecified"],
            "required": true
        },
        {
            "id": "command_description",
            "name": "Command Description",
            "description": "Acceptable Types: Text, Unspecified\n\nDescription: The description for this command.",
            "types": ["text", "unspecified"]
        },
        {
            "id": "command_options",
            "name": "Command Options",
            "description": "Acceptable Types: Object, Unspecified\n\nDescription: The options for this command.",
            "types": ["object", "unspecified"]
        },
    ],

    options: [
        {
            "id": "command_type",
            "name": "Command Type",
            "description": "Description: The type of command.",
            "type": "SELECT",
            "options": {
                "chat_input": "Chat Input (Slash Command)",
                "user": "User's Context Menu (User Command)",
                "message": "Message's Context Menu (Message Command)"
            }
        },
        {
            "id": "command_dm_permission",
            "name": "Command Available in DMs",
            "description": "Description: Whether the command is available in DMs (only for global commands).",
            "type": "SELECT",
            "options": {
                "yes": "Yes",
                "no": "No"
            }
        },
        {
            "id": "command_nsfw",
            "name": "NSFW Command",
            "description": "Description: Whether the command is age-restricted.",
            "type": "SELECT",
            "options": {
                "no": "No",
                "yes": "Yes"
            }
        }
    ],

    outputs: [
        {
            "id": "action1",
            "name": "Action",
            "description": "Type: Action\n\nDescription: Executes the following blocks if there is no error message.",
            "types": ["action"]
        },
        {
            "id": "action2",
            "name": "Action (Error)",
            "description": "Type: Action\n\nDescription: Executes the following blocks if there is any error message.",
            "types": ["action"]
        },
        {
            "id": "message",
            "name": "Message",
            "description": "Type: Object\n\nDescription: The command author's message.",
            "types": ["object"]
        },
        {
            "id": "channel",
            "name": "Channel",
            "description": "Type: Object\n\nDescription: The command author's message channel.",
            "types": ["object"]
        },
        {
            "id": "user",
            "name": "User",
            "description": "Type: Object\n\nDescription: The command author.",
            "types": ["object"]
        },
        {
            "id": "error_message",
            "name": "Error Message",
            "description": "Type: Object\n\nDescription: The error message if the user is still in slowmode, does not have the required permission or other restriction violated.\n\nPossible Values: \"Command Restriction\", \"User Permission\", \"User Slowmode\", \"Nothing\".",
            "types": ["text"]
        }
    ],

    init(DBB, fileName) {
        const Data = DBB.Blocks.Data;
        const slowmodeData = Data.getData("slowmode", fileName, "block");

        if(slowmodeData && DBB.Core.typeof(slowmodeData) == "object") {
            for (const commandName in slowmodeData) {
                const userIDs = slowmodeData[commandName];

                for (const userID in userIDs) {
                    const discordIDs = userIDs[userID];

                    for (const discordID in discordIDs) {
                        const time = discordIDs[discordID];

                        if(Date.now() >= (parseInt(time) || 0)) delete discordIDs[discordID];
                    }

                    if(!Object.values(discordIDs).length) delete userIDs[userID];
                }

                if(!Object.values(userIDs).length) delete slowmodeData[commandName];
            }

            if(Object.values(slowmodeData).length) Data.setData("slowmode", slowmodeData, fileName, "block");
            else Data.deleteData("slowmode", fileName, "block");
        } else Data.deleteData("slowmode", fileName, "block");
    },

    code(cache, DBB) {
        const {PermissionFlagsBits, ChannelType} = require("discord.js");

        const permissions = {
            none: "none",
            administrator: PermissionFlagsBits.Administrator,
            create_instant_invite: PermissionFlagsBits.CreateInstantInvite,
            kick_members: PermissionFlagsBits.KickMembers,
            ban_members: PermissionFlagsBits.BanMembers,
            manage_channels: PermissionFlagsBits.ManageChannels,
            manage_guild: PermissionFlagsBits.ManageGuild,
            add_reactions: PermissionFlagsBits.AddReactions,
            view_audit_log: PermissionFlagsBits.ViewAuditLog,
            priority_speaker: PermissionFlagsBits.PrioritySpeaker,
            stream: PermissionFlagsBits.Stream,
            view_channel: PermissionFlagsBits.ViewChannel,
            send_messages: PermissionFlagsBits.SendMessages,
            send_tts_messages: PermissionFlagsBits.SendTTSMessages,
            manage_messages: PermissionFlagsBits.ManageMessages,
            embed_links: PermissionFlagsBits.EmbedLinks,
            attach_files: PermissionFlagsBits.AttachFiles,
            read_message_history: PermissionFlagsBits.ReadMessageHistory,
            mention_everyone: PermissionFlagsBits.MentionEveryone,
            use_external_emojis: PermissionFlagsBits.UseExternalEmojis,
            view_guild_insights: PermissionFlagsBits.ViewGuildInsights,
            connect: PermissionFlagsBits.Connect,
            speak: PermissionFlagsBits.Speak,
            mute_members: PermissionFlagsBits.MuteMembers,
            deafen_members: PermissionFlagsBits.DeafenMembers,
            move_members: PermissionFlagsBits.MoveMembers,
            use_vad: PermissionFlagsBits.UseVAD,
            change_nickname: PermissionFlagsBits.ChangeNickname,
            manage_nicknames: PermissionFlagsBits.ManageNicknames,
            manage_roles: PermissionFlagsBits.ManageRoles,
            manage_webhooks: PermissionFlagsBits.ManageWebhooks,
            manage_emojis: PermissionFlagsBits.ManageEmojisAndStickers
        }

        let command_name = this.GetInputValue("command_name", cache);
        const custom_prefix = this.GetInputValue("custom_prefix", cache, true);
        let command_slowmode = this.GetInputValue("command_slowmode", cache);
        const command_restriction = this.GetOptionValue("command_restriction", cache) + "";
        const required_member_permission = permissions[this.GetOptionValue("required_member_permission", cache) + ""];
        const case_sensitive = this.GetOptionValue("case_sensitive", cache) == "yes";
        const command_slowmode_restriction = this.GetOptionValue("command_slowmode_restriction", cache) + "";

        command_name = typeof command_name == "string" ? command_name : "";
        if(case_sensitive) command_name = command_name.toLowerCase();

        command_slowmode = Math.max(0, command_slowmode instanceof Date ? command_slowmode.getTime() : Date.now() + parseInt(command_slowmode));

        const {prefixes, owners} = DBB.Data.data.dbb;

        let prefix = prefixes.main;
        if(custom_prefix) prefix = custom_prefix.value + "";


        function CheckCommandRestriction(msg) {
            switch(command_restriction) {
                default: // "none"
                    return [true, msg.member ? CheckPermission(msg.member) : true];
                case "server_only":
                    return [Boolean(msg.guild), CheckPermission(msg.member)];
                case "server_owner_only":
                    return [msg.guild && msg.guild.owner.id == msg.member.id, true];
                case "bot_owner_only":
                    return [owners.includes(msg.author.id), true];
                case "dms_only":
                    return [msg.channel.type == ChannelType.DM, true];
            }
        }

        function CheckPermission(member) {
            if(required_member_permission == "none") return true;
            else if(!member) return false;
            return member.permissions.has(required_member_permission);
        }


        function ExtraCheckSlowmode(userData, targetID, slowmodeData) {
            if(userData[targetID] >= Date.now())
                return false;
            
            userData[targetID] = command_slowmode;

            this.setData("slowmode", slowmodeData, command_name, "block");

            return true;
        }
        function CheckSlowmode(msg) {
            let slowmodeData = this.getData("slowmode", command_name, "block");

            if(!(slowmodeData && DBB.Core.typeof(slowmodeData) == "object"))
                slowmodeData = {}

            const userIDs = slowmodeData[command_name];

            if(!(userIDs && DBB.Core.typeof(userIDs) == "object"))
                slowmodeData[command_name] = {}

            const authorId = msg.author.id
            const userData = userIDs[authorId];

            if(!(userData && DBB.Core.typeof(userData) == "object"))
                userIDs[authorId] = {}

            switch(command_slowmode_restriction) {
                case "channel":
                    return ExtraCheckSlowmode(userData, msg.channel.id, slowmodeData);
                case "server/dm":
                    return ExtraCheckSlowmode(userData, msg.guild ? msg.guild.id : msg.channel.id, slowmodeData);
                case "everywhere":
                    return ExtraCheckSlowmode(userData, "global");
                default:
                    return true;
            }
        }


        const EndBlock = (msg, reason, action) => {
            this.StoreOutputValue(msg, "message", cache);
            this.StoreOutputValue(msg.channel, "channel", cache);
            this.StoreOutputValue(msg.author, "user", cache);
            this.StoreOutputValue(reason, "error_message", cache);
            this.RunNextBlock(action ? "action1" : "action2", cache);
        }

        this.events.on("messageCreate", msg => {
            if(msg.author.bot) return;

            const _prefix = !custom_prefix && msg.guild && msg.guild.id in prefixes.servers ? prefixes.servers[msg.guild.id] : prefix;

            let content = msg.content.trim();
            if(case_sensitive) content = content.toLowerCase();

            if(!content.startsWith(_prefix + command_name)) return;


            const restriction = CheckCommandRestriction(msg);

            if(!restriction[0]) EndBlock(msg, "Command Restriction");
            else if(!restriction[1]) EndBlock(msg, "Member Permission");
            else if(command_slowmode && !CheckSlowmode(msg)) EndBlock(msg, "User Slowmode");
            else EndBlock(msg, "Nothing", true);
        });
    }
}