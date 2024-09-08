import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelChats } from './ChannelChats';
import { ChannelMembers } from './ChannelMembers';
import { Users } from './Users';
import { Workspaces } from './Workspaces';

@Index('idx_channels_workspaceid', ['WorkspaceId'], {})
@Entity({ schema: 'public' })
export class Channels {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 30 })
  name: string;

  @Column('boolean', {
    name: 'private',
    nullable: true,
    default: false,
  })
  private: boolean | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int', { name: 'WorkspaceId', nullable: true })
  WorkspaceId: number | null;

  @OneToMany(() => ChannelChats, (channelchats) => channelchats.Channel)
  ChannelChats: ChannelChats[];

  @OneToMany(() => ChannelMembers, (channelMembers) => channelMembers.Channel, {
    cascade: ['insert'],
  })
  ChannelMembers: ChannelMembers[];

  @ManyToMany(() => Users, (users) => users.Channels)
  Members: Users[];

  @ManyToOne(() => Workspaces, (workspaces) => workspaces.Channels, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'WorkspaceId', referencedColumnName: 'id' }])
  Workspace: Workspaces;
}
